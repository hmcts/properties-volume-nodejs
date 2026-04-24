process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';

import * as config from 'config';
import { execFile } from 'child_process';
import * as properties from '../src';

const mockSecrets: Record<string, string> = {
  'secret-one': 'vaultOne.secret-one',
  secret_Two: 'vaultOne.secret_Two',
  'secret-three': 'vaultTwo.secret-three',
  secret_Four: 'vaultTwo.secret_Four',
  'extra-secret': 'vaultOne.extra-secret',
};

jest.mock('child_process', () => {
  return {
    execFile: jest.fn(),
  };
});

type ExecFileCallback = (error: NodeJS.ErrnoException | null, stdout: string, stderr: string) => void;

const mockedExecFile = execFile as unknown as jest.Mock;

describe('Read properties from Azure.', () => {
  beforeEach(() => {
    mockedExecFile.mockReset();
    mockedExecFile.mockImplementation(
      (_command: string, args: string[], _options: Record<string, string>, callback: ExecFileCallback) => {
        const secretName = args[args.indexOf('--name') + 1];

        callback(null, JSON.stringify(mockSecrets[secretName]) + '\n', '');
      }
    );
  });

  test('should use chart to load secrets', async () => {
    const testConfig: any = {};
    const theConfig = await properties.addFromAzureVault(testConfig, {
      pathToHelmChart: '__tests__/chart/values.yaml',
    });

    expect(testConfig['secrets']['vaultOne']['secret-one']).toBe(undefined);
    expect(testConfig['secrets']['vaultOne']['SECRET_ONE_ALIAS']).toBe('vaultOne.secret-one');
    expect(testConfig['secrets']['vaultOne']['secret_Two']).toBe('vaultOne.secret_Two');
    expect(testConfig['secrets']['vaultTwo']['secret-three']).toBe('vaultTwo.secret-three');
    expect(testConfig['secrets']['vaultTwo']['secret_Four']).toBe('vaultTwo.secret_Four');

    expect(theConfig).toBe(testConfig);
    expect(mockedExecFile).toHaveBeenCalledWith(
      'az',
      [
        'keyvault',
        'secret',
        'show',
        '--vault-name',
        'vaultOne-aat',
        '--name',
        'secret-one',
        '--query',
        'value',
        '--output',
        'json',
        '--only-show-errors',
      ],
      { encoding: 'utf8' },
      expect.any(Function)
    );
  });

  test('should be able to use actual config module as expected', async () => {
    await properties.addFromAzureVault(config, {
      pathToHelmChart: '__tests__/chart/values.yaml',
    });

    expect(config.get('secrets.vaultOne.secret-one')).toBe('default1');
    expect(config.get('secrets.vaultOne.secret_Two')).toBe('vaultOne.secret_Two');
  });

  test('should throw an actionable exception if Azure CLI authentication fails', async () => {
    mockedExecFile.mockImplementation(
      (_command: string, _args: string[], _options: Record<string, string>, callback: ExecFileCallback) => {
        const error = new Error('Command failed') as NodeJS.ErrnoException;

        error.code = '1';
        callback(error, '', 'ERROR: Please run az login to setup account.');
      }
    );

    await expect(
      properties.addFromAzureVault(
        {},
        {
          pathToHelmChart: '__tests__/chart/values.yaml',
        }
      )
    ).rejects.toThrow(
      "properties-volume failed with: Azure CLI failed to read secret 'secret-one' from vault 'vaultOne-aat': " +
        "ERROR: Please run az login to setup account. Install Azure CLI, run 'az login', and confirm access to the Key Vault."
    );
  });

  test('should throw correct exception if the chart does not exist', async () => {
    await expect(
      properties.addFromAzureVault(config, {
        pathToHelmChart: '__tests__/chart/does-not-exist.yaml',
      })
    ).rejects.toThrow("helm chart not found at: '__tests__/chart/does-not-exist.yaml'");
  });

  test('should skip chart-declared secrets listed in omit', async () => {
    const testConfig: any = {};
    await properties.addFromAzureVault(testConfig, {
      pathToHelmChart: '__tests__/chart/values.yaml',
      omit: ['secret-one'],
    });

    expect(testConfig['secrets']['vaultOne']['SECRET_ONE_ALIAS']).toBe(undefined);
    expect(testConfig['secrets']['vaultOne']['secret_Two']).toBe('vaultOne.secret_Two');
    expect(testConfig['secrets']['vaultTwo']['secret-three']).toBe('vaultTwo.secret-three');
    expect(testConfig['secrets']['vaultTwo']['secret_Four']).toBe('vaultTwo.secret_Four');
  });

  test('should load extra secrets from additional into the first vault', async () => {
    const testConfig: any = {};
    await properties.addFromAzureVault(testConfig, {
      pathToHelmChart: '__tests__/chart/values.yaml',
      additional: new Map([['extra-secret', 'EXTRA_ALIAS']]),
    });

    expect(testConfig['secrets']['vaultOne']['EXTRA_ALIAS']).toBe('vaultOne.extra-secret');
    expect(testConfig['secrets']['vaultTwo']['EXTRA_ALIAS']).toBe(undefined);
  });

  test('should not apply omit to additional secrets', async () => {
    const testConfig: any = {};
    await properties.addFromAzureVault(testConfig, {
      pathToHelmChart: '__tests__/chart/values.yaml',
      omit: ['extra-secret'],
      additional: new Map([['extra-secret', 'EXTRA_ALIAS']]),
    });

    expect(testConfig['secrets']['vaultOne']['EXTRA_ALIAS']).toBe('vaultOne.extra-secret');
  });
});
