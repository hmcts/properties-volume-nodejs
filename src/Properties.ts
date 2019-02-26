import { Logger } from '@hmcts/nodejs-logging'
import merge = require('lodash.merge')
import * as fs from 'fs'
import { PathLike } from 'fs'

const log = Logger.getLogger('applicationRunner')

interface Options {
  mountPoint?: fs.PathLike
  failOnError?: boolean
}

const defaultOptions: Options = {
  mountPoint: '/mnt/secrets/',
  failOnError: false
}

export function addTo (config: any, givenOptions?: Options) {
  const options: Options = merge({}, defaultOptions, givenOptions || {})
  const mountPoint: PathLike = options.mountPoint!
  const failOnError: boolean = options.failOnError!

  log.info(`Reading properties from volume: '${mountPoint}'`)
  try {
    const properties = readVaults(mountPoint)
    const prefix = getPrefix(mountPoint.toString())
    config[prefix] = merge(config[prefix] || {}, properties)
  } catch (error) {
    if (failOnError) {
      throw Error(`properties-volume failed with:'${error}`)
    }
    log.info(`Reading properties from volume: '${mountPoint}' FAILED with '${error}'`)
  }
  return config
}

function getPrefix (path: string) {
  return path.substr(path.lastIndexOf('/') + 1)
}

function addDir (dir: string, obj: any, mountPoint: fs.PathLike): any {
  obj[dir] = readDirectories(mountPoint, dir).reduce((values, file) => addFile(values, file, mountPoint, dir), {})
  return obj
}

function addFile (values: any, file: string, mountPoint: fs.PathLike, dir: string): any {
  values[file] = readFile(mountPoint, dir, file).trim()
  return values
}

function readFile (mountPoint: fs.PathLike, dir: string, file: string): string {
  return fs.readFileSync(mountPoint + '/' + dir + '/' + file, 'utf8')
}

function readDirectories (mountPoint: fs.PathLike, dir: string): string[] {
  return fs.readdirSync(mountPoint + '/' + dir)
}

function readVaults (mountPoint: fs.PathLike) {
  return fs.readdirSync(mountPoint, null).reduce((obj, dir) => addDir(dir, obj, mountPoint), {})
}
