process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'

import * as properties from '../src'
import * as config from 'config'

properties.addTo(config, {mountPoint: '__tests__/testVolumes/testVol/'})
properties.addTo(config, {mountPoint: '__tests__/testVolumes/secrets'})

describe('Read properties from files on a mount or folder.', () => {
  test('should start with secrets read from volume', () => {
    const testConfig: any = {}
    const theConfig = properties.addTo(testConfig, { mountPoint: '__tests__/testVolumes/secrets' })
    expect(testConfig['secrets']['vaultOne']['secret-one']).toBe('vaultOne.secret-one')
    expect(testConfig['secrets']['vaultOne']['secret_Three']).toBe('vaultOne.secret_Three')
    expect(testConfig['secrets']['vaultTwo']['secret-one']).toBe('vaultTwo.secret-one')
    expect(testConfig['secrets']['vaultTwo']['secretTwo']).toBe('vaultTwo.secretTwo')
    expect(theConfig).toBe(testConfig)
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

  test('should have defaults (existing properties) if not overridden', () => {
    expect(config.get('secrets.vaultOne.secret-default')).toBe('default')
    expect(config.get('secrets.vaultTwo.secret-default')).toBe('default2')
    expect(config.get('secrets.someOther_vault.secret-default')).toBe('someother')
  })

  test('should throw correct exception if /mnt/secrets does not exist', () => {
    expect(() => properties.addTo(config, { failOnError: true }))
      .toThrowError("properties-volume failed with:'Error: ENOENT: no such file or directory, scandir '/mnt/secrets/'")
  })

  test('should not throw exception if failOnError is false', () => {
    properties.addTo(config, { failOnError: false })
  })

  test('should throw error if does not have a folder in the mountPoint path', () => {
    expect(() => properties.addTo(config,{ mountPoint: '/', failOnError: true }))
      .toThrowError('Invalid properties mount point supplied: \'/\'')
  })

})
