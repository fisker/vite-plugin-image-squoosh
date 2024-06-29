# vite-plugin-image-minify

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][coveralls_badge]][coveralls_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/actions/workflow/status/fisker/vite-plugin-image-minify/continuous-integration.yml?branch=main&style=flat-square
[github_actions_link]: https://github.com/fisker/vite-plugin-image-minify/actions?query=branch%3Amain
[coveralls_badge]: https://img.shields.io/coveralls/github/fisker/vite-plugin-image-minify/main?style=flat-square
[coveralls_link]: https://coveralls.io/github/fisker/vite-plugin-image-minify?branch=main
[license_badge]: https://img.shields.io/npm/l/vite-plugin-image-minify.svg?style=flat-square
[license_link]: https://github.com/fisker/vite-plugin-image-minify/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/vite-plugin-image-minify.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/vite-plugin-image-minify

> Vite plugin to minify images.

## Install

```bash
yarn add vite-plugin-image-minify --dev
```

## Usage

Add `vite-plugin-image-minify` to your Vite config file.

```js
import vitePluginImageMinify from 'vite-plugin-image-minify'

export default {
  plugins: [
    vitePluginImageMinify(),
  ],
},
```
