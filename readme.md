# vite-plugin-image-squoosh

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][coveralls_badge]][coveralls_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/actions/workflow/status/fisker/vite-plugin-image-squoosh/continuous-integration.yml?branch=main&style=flat-square
[github_actions_link]: https://github.com/fisker/vite-plugin-image-squoosh/actions?query=branch%3Amain
[coveralls_badge]: https://img.shields.io/coveralls/github/fisker/vite-plugin-image-squoosh/main?style=flat-square
[coveralls_link]: https://coveralls.io/github/fisker/vite-plugin-image-squoosh?branch=main
[license_badge]: https://img.shields.io/npm/l/vite-plugin-image-squoosh.svg?style=flat-square
[license_link]: https://github.com/fisker/vite-plugin-image-squoosh/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/vite-plugin-image-squoosh.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/vite-plugin-image-squoosh

> Vite plugin to run squoosh on images.

## Install

```bash
yarn add vite-plugin-image-squoosh --dev
```

## Usage

Add `vite-plugin-image-squoosh` to your Vite config file.

```js
import vitePluginImageSquoosh from 'vite-plugin-image-squoosh'

export default {
  plugins: [
    vitePluginImageSquoosh(),
  ],
},
```
