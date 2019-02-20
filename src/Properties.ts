import { Logger } from '@hmcts/nodejs-logging'
import merge from 'lodash.merge'
import * as fs from 'fs'

const log = Logger.getLogger('applicationRunner')

export function addTo (config: any, mountPoint: fs.PathLike = '/mnt/secrets/') {
  log.info(`Reading properties from volume: '${mountPoint}'`)
  const properties = readVaults(mountPoint)
  let path = mountPoint.toString()
  const prefix = getPref(path)
  config[prefix] = merge(config[prefix] || {}, properties)
}

function getPref (path: string) {
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
