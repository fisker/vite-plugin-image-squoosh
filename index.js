import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {isSupportedImage, squooshImages} from './squoosh.js'
import optimizeSvg from './svgo.js'
import Cache from './cache.js'
import packageJson from './package-json-proxy.cjs'

async function minifyWithSquoosh(bundle, cache) {
  /** @type {import('vite').Rollup.OutputAsset[]} */
  const images = Object.values(bundle).filter(
    (assetOrChunk) =>
      assetOrChunk.type === 'asset' && isSupportedImage(assetOrChunk.fileName),
  )

  if (images.length === 0) {
    return
  }

  const compressed = await squooshImages(
    images.map((image) => ({content: image.source, name: image.fileName})),
    cache,
  )

  for (const [index, image] of images.entries()) {
    const original = image.source
    const updated = compressed[index]
    cache.updateCache(original, updated)

    bundle[image.fileName].source = updated
  }
}

async function minifySvg(bundle, cache) {
  /** @type {import('vite').Rollup.OutputAsset[]} */
  const images = Object.values(bundle).filter(
    (assetOrChunk) =>
      assetOrChunk.type === 'asset' && /\.svg$/i.test(assetOrChunk.fileName),
  )

  for (const {fileName: name, source: content} of images) {
    const cached = cache.getCachedData(content)
    const compressed = cached ?? optimizeSvg(content)
    cache.updateCache(content, compressed)
    bundle[name].source = compressed
  }
}

function createVitePluginImageMinify(options) {
  const cacheEnabled = options?.__test_enable_cache !== false
  let root

  /**
   * @type {import('vite').Plugin}
   */
  return {
    name: packageJson.name,
    apply: 'build',
    config(config) {
      ;({root} = config)
    },
    async generateBundle(options, bundle) {
      for (const [fileName, assetOrChunk] of Object.entries(bundle)) {
        assert.equal(fileName, assetOrChunk.fileName, 'Unexpected asset')
      }

      const cache = cacheEnabled
        ? new Cache(root)
        : {
            getCachedData() {},
            updateCache() {},
            writeFile() {},
          }
      await minifyWithSquoosh(bundle, cache)
      await minifySvg(bundle, cache)

      cache.writeFile()
    },
  }
}

export default createVitePluginImageMinify
