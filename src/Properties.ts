// import { Logger } from '@hmcts/nodejs-logging'
import { PathLike } from 'fs'
import * as fs from 'fs'

// const logger = Logger.getLogger('applicationRunner')

export class Properties {
  public static addTo (config: any, mountPoint: PathLike = '/mnt/secrets/') {
    // @ts-ignore
    let properties = fs.readdirSync(mountPoint, null)
      .reduce((obj, dir) => this.addDir(dir, obj, mountPoint), {})
    Object.assign(config, properties)
  }

  private static addDir (dir: string, obj: any, mountPoint: PathLike): any {
    obj[dir] = this.readDirectories(mountPoint, dir).reduce((values, file) => this.addFile(values, file, mountPoint, dir), {})
    return obj
  }

  private static addFile (values: any, file: string, mountPoint: PathLike, dir: string) {
    values[file] = this.readFile(mountPoint, dir, file).trim()
    return values
  }

  private static readFile (mountPoint: PathLike, dir: string, file: string) {
    return fs.readFileSync(mountPoint + '/' + dir + '/' + file,'utf8')
  }

  private static readDirectories (mountPoint: PathLike, dir: string) {
    return fs.readdirSync(mountPoint + '/' + dir)
  }
}
