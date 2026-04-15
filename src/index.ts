import * as fs from 'fs';

export interface Options {
  mountPoint?: fs.PathLike;
  failOnError?: boolean;
}

export interface LocalOptions {
  pathToHelmChart: fs.PathLike;
  env?: string;
  omit?: string[];
  additional?: Map<string, string>;
}

export { addTo } from './Properties';
export { addFromAzureVault } from './LocalAzureVault';
