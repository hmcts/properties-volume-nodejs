process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';

import * as config from 'config';
import * as properties from '../src';

jest.mock('@azure/identity', () => {
  return {
    DefaultAzureCredential: jest.fn(() => {
      return {};
    }),
  };
});

const mockSecrets: Record<string, string> = {
  'secret-one': 'vaultOne.secret-one',
  secret_Two: 'vaultOne.secret_Two',
  'secret-three': 'vaultTwo.secret-three',
  secret_Four: 'vaultTwo.secret_Four',
};

jest.mock('@azure/keyvault-secrets', () => {
  return {
    SecretClient: jest.fn(() => {
      return {
        getSecret: jest.fn((key: string) => {
          return {
            value: mockSecrets[key] as string,
          };
        }),
      };
    }),
  };
});

describe('Read properties from Azure.', () => {
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
  });

  test('should be able to use actual config module as expected', async () => {
    await properties.addFromAzureVault(config, {
      pathToHelmChart: '__tests__/chart/values.yaml',
    });

    expect(config.get('secrets.vaultOne.secret-one')).toBe('default1');
    expect(config.get('secrets.vaultOne.secret_Two')).toBe('vaultOne.secret_Two');
  });

  test('should throw correct exception if the chart does not exist', () => {
    expect(
      async () =>
        await properties.addFromAzureVault(config, {
          pathToHelmChart: '__tests__/chart/does-not-exist.yaml',
        })
    ).rejects.toThrowError("helm chart not found at: '__tests__/chart/does-not-exist.yaml'");
  });
});
