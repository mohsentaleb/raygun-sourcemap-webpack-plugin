# Raygun Sourcemap Plugin For Webpack


<img src="https://raygun.com/documentation/navigation/logo.svg" alt="Raygun" width="300"/>

<a href="https://github.com/microsoft/react-native-macos/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="React Native for macOS is released under the MIT license." />
  </a>
<a href="https://www.npmjs.com/package/raygun-sourcemap-webpack-plugin">
    <img src="https://img.shields.io/npm/dm/raygun-sourcemap-webpack-plugin.svg?style=flat-square" alt="Downloads" />
</a>
<a href="https://www.paypal.com/paypalme/mohsentaleb">
    <img src="https://img.shields.io/badge/Donate-PayPal-orange.svg" alt="PRs welcome!" />
</a>

This is a [Webpack](https://webpack.github.io) plugin that simplifies uploading the sourcemaps,
generated from a webpack build, to [Raygun](https://raygun.com/).

The heavy lifting for this plugin has been done by the talented contributors of [RollbarSourceMapPlugin](https://github.com/thredup/rollbar-sourcemap-webpack-plugin). This is just a customized and tested version for Raygun.

----

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Plugin Configuration](#plugin-configuration)
- [Webpack Sourcemap Configuration](#webpack-sourcemap-configuration)
- [App Configuration](#app-configuration)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Production JavaScript bundles are typically minified before deploying,
making Raygun stacktraces pretty useless unless you take steps to upload the sourcemaps.
You may be doing this now in a shell script, triggered during your deploy process,
that makes curl posts to the Raygun API. This can be finicky and error prone to setup.
`RaygunSourceMapPlugin` aims to remove that burden and automatically upload the sourcemaps when they are emitted by webpack.

## Prerequisites

Webpack 4+ is required. This plugin is not compatible with Webpack 3 and older.

## Installation

Install the plugin with npm:

```shell
npm install raygun-sourcemap-webpack-plugin --save-dev
```

## Basic Usage

An example `webpack.config.js`:

```javascript
const RaygunSourceMapPlugin = require('raygun-sourcemap-webpack-plugin')

const PUBLIC_PATH = 'https://my.cdn.net/assets'

const webpackConfig = {
  mode: 'production',
  devtool: 'hidden-source-map'
  entry: 'index',
  publicPath: PUBLIC_PATH,
  output: {
    path: 'dist',
    filename: 'index-[hash].js'
  },
  plugins: [new RaygunSourceMapPlugin({
    accessToken: 'aaaabbbbccccddddeeeeffff00001111',
    appId: '1111111'
    publicPath: PUBLIC_PATH
  })]
}
```

## Plugin Configuration

You can pass a hash of configuration options to `RaygunSourceMapPlugin`.
Allowed values are as follows:

| Option | Required | Type | Description |
|---|---|---|---|
| `accessToken` | required | `string` | Your raygun **External Access Token**. You can get one from your profile [settings page](https://app.raygun.com/user). |
| `appId` | required | `string` | string identifying the id of the app this source map package is for. `appId` can be easily recognized from your dashboard URL. Just like `1111111` https://app.raygun.com/crashreporting/**1111111** |
| `publicPath` | required | `string \| function(string)` | The base url for the cdn where your production bundles are hosted or a function that receives the source file local address and returns the url for that file in the cdn where your production bundles are hosted.You should use the function form when your project has some kind of divergence between url routes and actual folder structure.For example: NextJs projects can serve bundled files in the following url `http://my.app/_next/123abc123abc123/page/home.js` but have a folder structure like this `APP_ROOT/build/bundles/pages/home.js`.The function form allows you to transform the final public url in order to conform with your routing needs. |
| `includeChunks` | *optional* | `string \| [string]` | An array of chunks for which sourcemaps should be uploaded.This should correspond to the names in the webpack config `entry` field.If there's only one chunk, it can be a string rather than an array.If not supplied, all sourcemaps emitted by webpack will be uploaded, including those for unnamed chunks. |
| `silent` | *optional* `false` | `boolean` | If `false`, success and warning messages will be logged to the console for each upload. Note: if you also do not want to see errors, set the `ignoreErrors` option to `true`. |
| `ignoreErrors` | *optional* `false` | `boolean` | Set to `true` to bypass adding upload errors to the webpack compilation. Do this if you do not want to fail the build when sourcemap uploads fail.If you do not want to fail the build but you do want to see the failures as warnings, make sure `silent` option is set to `false`. |
| `raygunEndpoint` | *optional* [1] | `string` | A string defining the Raygun API endpoint to upload the sourcemaps to. |
| `encodeFilename` | *optional* `false` | `boolean` | Set to true to encode the filename. NextJS will reference the encode the URL when referencing the minified script which must match exactly with the minified file URL uploaded to Raygun. |

[1] - https://app.raygun.com/upload/jssymbols



## Webpack Sourcemap Configuration

The [`output.devtool`](https://webpack.js.org/configuration/devtool/) field in webpack configuration controls how sourcemaps are generated.
The recommended setup for sourcemaps in a production app is to use hidden sourcemaps.
This will include original sources in your sourcemaps, which will be uploaded to Raygun and NOT to a public location alongside the minified javascript.
The `hidden` prefix will prevent `//# sourceMappingURL=URL_TO_SOURCE_MAP` from being inserted in the minified javascript.
This is important because if the `sourceMappingURL` comment is present,
Raygun will attempt to download the sourcemap from this url, which negates the whole
purpose of this plugin. And since you are not uploading sourcemaps to a public location,
Raygun would not be able to download the sourcemaps.

`webpack.config.js`

```
output: {
  devtool: 'hidden-source-map'
}
```

## App Configuration

- The web app should have [Raygun4JS](https://raygun.com/documentation/language-guides/javascript/crash-reporting/installation/) installed.
- See the [Raygun Sourcemaps](https://raygun.com/documentation/product-guides/crash-reporting/sourcemaps/) documentation
  for how to configure the client side for sourcemap support.

## Contributing

See the [Contributors Guide](/CONTRIBUTING.md)

## License

[MIT](/LICENSE.md)
