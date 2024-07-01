import {getAssets, isSvgFile} from './utilities.js'

import {isSupportedImage, squooshImages} from './squoosh.js'
import optimizeSvg from './svgo.js'
import Cache from './cache.js'
import packageJson from './package-json-proxy.cjs'

async function minifyWithSquoosh(bundle, cache) {
  const images = [
    ...getAssets(bundle, (filename) => isSupportedImage(filename)),
  ]

  if (images.length === 0) {
    return
  }

  const compressedImages = await squooshImages(
    images.map((image) => ({content: image.source, name: image.fileName})),
    cache,
  )

  for (const [index, image] of images.entries()) {
    const original = image.source
    const compressed = compressedImages[index]

    cache.updateCache(original, compressed)
    image.source = compressed
  }
}

async function minifySvg(bundle, cache) {
  for (const image of getAssets(bundle, (filename) => isSvgFile(filename))) {
    const original = image.source
    const compressed =
      cache.getCachedData(original) ?? optimizeSvg(original, {multipass: true})

    cache.updateCache(original, compressed)
    image.source = compressed
  }
}

function createVitePluginImageMinify(options) {
  const cacheEnabled = options?.__test_enable_cache !== false
  let viteConfig

  /**
   * @type {import('vite').Plugin}
   */
  return {
    name: packageJson.name,
    apply: 'build',
    configResolved(config) {
      viteConfig = config
    },
    async generateBundle(options, bundle) {
      const cache = cacheEnabled
        ? new Cache(viteConfig)
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
