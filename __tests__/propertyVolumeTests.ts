import * as properties from '../src'

process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'
import * as config from 'config'
properties.addTo(config, '__tests__/testVolumes/testVol')
properties.addTo(config, '__tests__/testVolumes/secrets')

describe('Read properties from files on a mount or folder.', () => {
  test('should start have secrets read from volume', () => {
    const config: any = {}
    properties.addTo(config, '__tests__/testVolumes/secrets')
    expect(config['secrets']['vaultOne']['secret-one']).toBe('vaultOne.secret-one')
    expect(config['secrets']['vaultOne']['secret_Three']).toBe('vaultOne.secret_Three')
    expect(config['secrets']['vaultTwo']['secret-one']).toBe('vaultTwo.secret-one')
    expect(config['secrets']['vaultTwo']['secretTwo']).toBe('vaultTwo.secretTwo')
  })

  test('should be able to use actual config module as expected', () => {
    expect(config.get('secrets.vaultOne.secret-one')).toBe('vaultOne.secret-one')
    expect(config.get('secrets.vaultOne.secret_Three')).toBe('vaultOne.secret_Three')
    expect(config.get('secrets.vaultTwo.secret-one')).toBe('vaultTwo.secret-one')
    expect(config.get('secrets.vaultTwo.secretTwo')).toBe('vaultTwo.secretTwo')
    expect(config.get('secrets.vaultX.secret-one')).toBe('x')
  })

  test('should be able to use other mounts and reset the prefix', () => {
    expect(config.get('testVol.vaultOne.secret-one')).toBe('vaultOne.secret-one')
    expect(config.get('testVol.vaultTwo.secret-one')).toBe('vaultTwo.secret-one')
  })

  test('should have defaults (existing properties if not overridden', () => {
    expect(config.get('secrets.vaultOne.secret-default')).toBe('default')
    expect(config.get('secrets.vaultTwo.secret-default')).toBe('default2')
    expect(config.get('secrets.someOther_vault.secret-default')).toBe('someother')
  })

})
