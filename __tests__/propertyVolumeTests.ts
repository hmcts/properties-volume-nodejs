import * as properties from '../src'
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
  })
})
