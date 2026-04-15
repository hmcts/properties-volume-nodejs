import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import * as yaml from 'js-yaml';
import { Logger } from '@hmcts/nodejs-logging';
import * as fs from 'fs';
import { LocalOptions } from './index';
import { merge } from 'lodash';

const log = Logger.getLogger('applicationRunner');

export async function addFromAzureVault(config: any, options: LocalOptions): Promise<any> {
  const env = options.env || 'aat';
  const omit = options.omit || [];
  const additional = options.additional;

  log.info(`Attempting to read properties from volume: '${options.pathToHelmChart}' using env: '${env}'`);

  if (!options.pathToHelmChart || !fs.existsSync(options.pathToHelmChart)) {
    throw new Error(`helm chart not found at: '${options.pathToHelmChart}'`);
  }

  try {
    const chart: any = yaml.load(fs.readFileSync(options.pathToHelmChart, 'utf8'));
    const secrets = await readVaultsFromAzure(chart, env, omit, additional);

    config['secrets'] = merge(config['secrets'] || {}, secrets);

    return config;
  } catch (error: any) {
    log.error(error);
    throw Error(`properties-volume failed with: ${error}`);
  }
}

async function readVaultsFromAzure(chart: any, env: string, omit: string[], additional?: Map<string, string>) {
  const credential = new DefaultAzureCredential();
  const vaultSecrets = deepSearch(chart, 'keyVaults');

  if (!vaultSecrets) {
    throw new Error('No keyVaults found in helm chart');
  }

  const vaultNames = Object.keys(vaultSecrets);
  const firstVaultName = vaultNames[0];

  const vaultPromises = vaultNames.map(vaultName =>
    readVaultFromAzure(
      vaultSecrets[vaultName],
      vaultName,
      env,
      credential,
      omit,
      vaultName === firstVaultName ? additional : undefined
    )
  );

  const vaults = await Promise.all(vaultPromises);

  return merge({}, ...vaults);
}

async function readVaultFromAzure(
  vaultSecrets: any,
  vaultName: string,
  env: string,
  credential: DefaultAzureCredential,
  omit: string[],
  additional?: Map<string, string>
) {
  const vaultUri = `https://${vaultName}-${env}.vault.azure.net`;
  const client = new SecretClient(vaultUri, credential);

  const chartSecrets: StructuredOrUnstructuredSecret[] = vaultSecrets?.secrets || [];
  const filteredChartSecrets = chartSecrets.filter(secret => {
    const name = typeof secret === 'string' ? secret : secret?.name;
    return !omit.includes(name);
  });

  const extras: StructuredSecret[] = additional ? Array.from(additional, ([name, alias]) => ({ name, alias })) : [];
  const allSecrets: StructuredOrUnstructuredSecret[] = [...filteredChartSecrets, ...extras];
  const secretPromises = allSecrets.map(secret => normalizeSecret(secret)).map(secret => loadSecret(client, secret));
  const loadedSecrets = await Promise.all(secretPromises);

  return { [vaultName]: merge({}, ...loadedSecrets) };
}

function deepSearch(obj: Record<string, any>, key: string): Record<string, any> | undefined {
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  }
  for (const k in obj) {
    if (typeof obj[k] === 'object') {
      const result = deepSearch(obj[k], key);
      if (result) {
        return result;
      }
    }
  }
}

function normalizeSecret(secret: any): StructuredSecret {
  return {
    alias: secret?.alias || secret,
    name: secret?.name || secret,
  };
}

async function loadSecret(client: SecretClient, secret: StructuredSecret): Promise<Record<string, string | undefined>> {
  const secretValue = await client.getSecret(secret.name);
  return { [secret.alias]: secretValue.value };
}

type StructuredSecret = {
  alias: string;
  name: string;
};

type StructuredOrUnstructuredSecret = string | StructuredSecret;
