import * as properties from '../src'

process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'
import * as config from 'config'

describe('Read properties from files on a mount or folder.', () => {
  test('should start have secrets read from volume', () => {
    const config: any = {}
    properties.addTo(config, '__tests__/testVolume')
    expect(config['keyVault']['vaultOne']['secret-one']).toBe('vaultOne.secret-one')
    expect(config['keyVault']['vaultOne']['secret_Three']).toBe('vaultOne.secret_Three')
    expect(config['keyVault']['vaultTwo']['secret-one']).toBe('vaultTwo.secret-one')
    expect(config['keyVault']['vaultTwo']['secretTwo']).toBe('vaultTwo.secretTwo')
  })

  test('should be able to use actual config module as expected', () => {
    properties.addTo(config, '__tests__/testVolume')
    expect(config.get('keyVault.vaultOne.secret-one')).toBe('vaultOne.secret-one')
    expect(config.get('keyVault.vaultOne.secret_Three')).toBe('vaultOne.secret_Three')
    expect(config.get('keyVault.vaultTwo.secret-one')).toBe('vaultTwo.secret-one')
    expect(config.get('keyVault.vaultTwo.secretTwo')).toBe('vaultTwo.secretTwo')
    expect(config.get('keyVault.vaultX.secret-one')).toBe('x')
  })

  test('should have defaults (existing properties if not overridden', () => {
    expect(config.get('keyVault.vaultOne.secret-default')).toBe('default')
    expect(config.get('keyVault.vaultTwo.secret-default')).toBe('default2')
    expect(config.get('keyVault.someOther_vault.secret-default')).toBe('someother')
  })

})
