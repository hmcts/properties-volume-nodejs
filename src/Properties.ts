import { Logger } from '@hmcts/nodejs-logging';
import * as path from 'path';
import * as fs from 'fs';
import { Options } from './index';
const { merge } = require('lodash');

const log = Logger.getLogger('applicationRunner');

const defaultOptions: Options = {
  mountPoint: '/mnt/secrets/',
  failOnError: false,
};

export function addTo(config: any, givenOptions?: Options) {
  const options: Options = merge({}, defaultOptions, givenOptions || {});
  const mountPoint: fs.PathLike = options.mountPoint!;
  const failOnError: boolean = options.failOnError!;

  log.info(`Attempting to read properties from volume: '${mountPoint}'`);
  try {
    const prefix = getPrefix(mountPoint.toString());
    const properties = readVaults(mountPoint);
    config[prefix] = merge(config[prefix] || {}, properties);
  } catch (error) {
    if (failOnError) {
      throw Error(`properties-volume failed with:'${error}`);
    }
    const localError: any = error;
    if (localError && localError.code && localError.code === 'ENOENT') {
      log.info("Could not find properties to load, check your config, you can ignore this if you don't expect any");
    } else {
      log.info(`Could not read properties from volume: '${mountPoint}' due to '${error}'`);
    }
  }
  return config;
}

function getPrefix(aPath: string) {
  const prefixFolder = path.basename(aPath);
  if (prefixFolder.length === 0) {
    throw new Error(`Invalid properties mount point supplied: '${aPath}'`);
  }
  return prefixFolder;
}

function addDir(dir: string, obj: any, mountPoint: fs.PathLike): any {
  obj[dir] = readDirectories(mountPoint, dir).reduce((values, file) => addFile(values, file, mountPoint, dir), {});
  return obj;
}

function addFile(values: any, file: string, mountPoint: fs.PathLike, dir: string): any {
  const filePath = readFile(mountPoint, dir, file);
  if (filePath) {
    values[file] = filePath.trim();
  }
  return values;
}

function readFile(mountPoint: fs.PathLike, dir: string, file: string): string | undefined {
  const filePath = mountPoint + '/' + dir + '/' + file;
  if (!fs.statSync(filePath).isDirectory()) {
    return fs.readFileSync(filePath, 'utf8');
  }
}

function readDirectories(mountPoint: fs.PathLike, dir: string): string[] {
  return fs.readdirSync(mountPoint + '/' + dir);
}

function readVaults(mountPoint: fs.PathLike) {
  return fs.readdirSync(mountPoint, null).reduce((obj, dir) => addDir(dir, obj, mountPoint), {});
}
