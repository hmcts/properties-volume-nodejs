import * as yaml from 'js-yaml';
import { Logger } from '@hmcts/nodejs-logging';
import { execFile } from 'child_process';
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
    const message = error instanceof Error ? error.message : error;
    throw Error(`properties-volume failed with: ${message}`);
  }
}

async function readVaultsFromAzure(chart: any, env: string, omit: string[], additional?: Map<string, string>) {
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
  omit: string[],
  additional?: Map<string, string>
) {
  const azureVaultName = `${vaultName}-${env}`;

  const chartSecrets: StructuredOrUnstructuredSecret[] = vaultSecrets?.secrets || [];
  const filteredChartSecrets = chartSecrets.filter(secret => {
    const name = typeof secret === 'string' ? secret : secret?.name;
    return !omit.includes(name);
  });

  const extras: StructuredSecret[] = additional ? Array.from(additional, ([name, alias]) => ({ name, alias })) : [];
  const allSecrets: StructuredOrUnstructuredSecret[] = [...filteredChartSecrets, ...extras];
  const secretPromises = allSecrets
    .map(secret => normalizeSecret(secret))
    .map(secret => loadSecret(azureVaultName, secret));
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

async function loadSecret(azureVaultName: string, secret: StructuredSecret): Promise<Record<string, string>> {
  const secretValue = await readSecretFromAzureCli(azureVaultName, secret.name);
  return { [secret.alias]: secretValue };
}

async function readSecretFromAzureCli(azureVaultName: string, secretName: string): Promise<string> {
  const stdout = await runAzureCli(
    [
      'keyvault',
      'secret',
      'show',
      '--vault-name',
      azureVaultName,
      '--name',
      secretName,
      '--query',
      'value',
      '--output',
      'json',
      '--only-show-errors',
    ],
    { azureVaultName, secretName }
  );

  return parseSecretValue(stdout, azureVaultName, secretName);
}

function runAzureCli(args: string[], context: AzureCliSecretContext): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('az', args, { encoding: 'utf8' }, (error, stdout, stderr) => {
      if (error) {
        reject(toAzureCliError(error, stderr, context));
        return;
      }

      resolve(stdout);
    });
  });
}

function parseSecretValue(stdout: string, azureVaultName: string, secretName: string): string {
  try {
    const value = JSON.parse(stdout);

    if (typeof value === 'string') {
      return value;
    }
  } catch {
    throw new Error(
      `Azure CLI returned an unexpected response for secret '${secretName}' from vault '${azureVaultName}'. ` +
        "Expected a JSON string from 'az keyvault secret show --query value --output json'."
    );
  }

  throw new Error(
    `Azure CLI returned an unexpected response for secret '${secretName}' from vault '${azureVaultName}'. ` +
      "Expected a JSON string from 'az keyvault secret show --query value --output json'."
  );
}

function toAzureCliError(
  error: Error & { code?: string | number | null },
  stderr: string,
  context: AzureCliSecretContext
): Error {
  const action = "Install Azure CLI, run 'az login', and confirm access to the Key Vault.";

  if (error.code === 'ENOENT') {
    return new Error(
      `Azure CLI executable 'az' was not found while reading secret '${context.secretName}' from vault ` +
        `'${context.azureVaultName}'. ${action}`
    );
  }

  const details = stderr.trim() || error.message;
  const separator = /[.!?]$/.test(details) ? ' ' : '. ';

  return new Error(
    `Azure CLI failed to read secret '${context.secretName}' from vault '${context.azureVaultName}': ` +
      `${details}${separator}${action}`
  );
}

type StructuredSecret = {
  alias: string;
  name: string;
};

type StructuredOrUnstructuredSecret = string | StructuredSecret;

type AzureCliSecretContext = {
  azureVaultName: string;
  secretName: string;
};
