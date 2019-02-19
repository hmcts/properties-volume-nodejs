import { Properties } from '../src'

describe('Azure flex properties module should read from specified mount', () => {
  test('should start have secrets', () => {
    let config = {}
    Properties.addTo(config, '__tests__/testVolume')
    // @ts-ignore
    expect(config['vaultOne']['secret-one']).toBe('vaultOne.secret-one')
  })
})
