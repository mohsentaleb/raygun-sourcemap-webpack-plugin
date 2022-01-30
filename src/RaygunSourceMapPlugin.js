import fs from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import isString from 'lodash.isstring';
import VError from 'verror';
import { handleError, validateOptions } from './helpers';
import { PLUGIN_NAME, RAYGUN_ENDPOINT } from './constants';

class RaygunSourceMapPlugin {
  constructor({
    accessToken,
    appId,
    publicPath,
    includeChunks = [],
    silent = false,
    ignoreErrors = false,
    raygunEndpoint = RAYGUN_ENDPOINT,
    encodeFilename = false
  }) {
    this.accessToken = accessToken;
    this.appId = appId;
    this.publicPath = publicPath;
    this.includeChunks = [].concat(includeChunks);
    this.silent = silent;
    this.ignoreErrors = ignoreErrors;
    this.raygunEndpoint = raygunEndpoint;
    this.encodeFilename = encodeFilename;
  }

  async afterEmit(compilation) {
    const errors = validateOptions(this);

    if (errors) {
      compilation.errors.push(...handleError(errors));
      return;
    }

    try {
      await this.uploadSourceMaps(compilation);
    } catch (err) {
      if (!this.ignoreErrors) {
        compilation.errors.push(...handleError(err));
      } else if (!this.silent) {
        compilation.warnings.push(...handleError(err));
      }
    }
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, this.afterEmit.bind(this));
  }

  // eslint-disable-next-line class-methods-use-this
  getAssetPath(compilation, name) {
    return join(
      compilation.getPath(compilation.compiler.outputPath),
      name.split('?')[0]
    );
  }

  getSource(compilation, name) {
    const path = this.getAssetPath(compilation, name);
    return fs.createReadStream(path);
  }

  getAssets(compilation) {
    const { includeChunks, encodeFilename } = this;
    const { chunks } = compilation.getStats().toJson();

    return chunks.reduce((result, chunk) => {
      const chunkName = chunk.names[0];
      if (includeChunks.length && includeChunks.indexOf(chunkName) === -1) {
        return result;
      }

      const sourceFile = chunk.files.find(file => /\.js$/.test(file));

      // webpack 5 stores source maps in `chunk.auxiliaryFiles` while webpack 4
      // stores them in `chunk.files`. This allows both webpack versions to work
      // with this plugin.
      const sourceMap = (chunk.auxiliaryFiles || chunk.files).find(file =>
        /\.js\.map$/.test(file)
      );

      if (!sourceFile || !sourceMap) {
        return result;
      }

      return [
        ...result,
        {
          sourceFile: encodeFilename ? encodeURI(sourceFile) : sourceFile,
          sourceMap
        }
      ];
    }, []);
  }

  getPublicPath(sourceFile) {
    if (isString(this.publicPath)) {
      const sep = this.publicPath.endsWith('/') ? '' : '/';
      return `${this.publicPath}${sep}${sourceFile}`;
    }
    return this.publicPath(sourceFile);
  }

  async uploadSourceMap(compilation, { sourceFile, sourceMap }) {
    const errMessage = `failed to upload ${sourceMap} to Raygun`;
    let sourceMapSource;

    try {
      sourceMapSource = await this.getSource(compilation, sourceMap);
    } catch (err) {
      throw new VError(err, errMessage);
    }

    const form = new FormData();
    form.append('url', this.getPublicPath(sourceFile));
    form.append('file', sourceMapSource);

    let res;
    try {
      res = await fetch(
        `${this.raygunEndpoint}${this.appId}?authToken=${this.accessToken}`,
        {
          method: 'POST',
          body: form
        }
      );
    } catch (err) {
      // Network or operational errors
      throw new VError(err, errMessage);
    }

    // 4xx or 5xx response
    if (!res.ok) {
      // Attempt to parse error details from response
      let details;
      try {
        const body = await res.json();
        details = body?.message ?? `${res.status} - ${res.statusText}`;
      } catch (parseErr) {
        details = `${res.status} - ${res.statusText}`;
      }

      throw new Error(`${errMessage}: ${details}`);
    }

    // Success
    if (!this.silent) {
      // eslint-disable-next-line no-console
      console.info(`Uploaded ${sourceMap} to Raygun (AppId: ${this.appId})`);
    }
  }

  uploadSourceMaps(compilation) {
    const assets = this.getAssets(compilation);

    /* istanbul ignore next */
    if (assets.length > 0) {
      process.stdout.write('\n');
    }
    return Promise.all(
      assets.map(asset => this.uploadSourceMap(compilation, asset))
    );
  }
}

module.exports = RaygunSourceMapPlugin;
