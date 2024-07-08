import * as path from 'node:path'
import {getAssets, isSvgFile} from './utilities.js'
import {isSupportedImage, squooshImages} from './squoosh.js'
import optimizeSvg from './svgo.js'
import Cache from './cache.js'
import packageJson from './package-json-proxy.cjs'
import isSvg from 'is-svg'

async function minifyWithSquoosh(bundle, {onFileExtensionError, cache}) {
  const images = [
    // `getAssets` is a generator function
    ...getAssets(bundle, (filename) => isSupportedImage(filename)),
  ]

  if (images.length === 0) {
    return
  }

  const compressedImages = await squooshImages(
    images.map((image) => ({
      content: image.source,
      name: image.fileName,
      _image: image,
    })),
    {cache, onFileExtensionError},
  )

  for (const [index, image] of images.entries()) {
    const original = image.source
    const compressed = compressedImages[index]

    cache.updateCache(original, compressed)
    image.source = compressed
  }
}

async function minifySvg(bundle, {onFileExtensionError, cache}) {
  for (const image of getAssets(bundle, (filename) => isSvgFile(filename))) {
    const original = image.source
    if (!isSvg(String(original))) {
      onFileExtensionError?.(image)
    }

    const compressed =
      cache.getCachedData(original) ?? optimizeSvg(original, {multipass: true})

    cache.updateCache(original, compressed)
    image.source = compressed
  }
}

const onFileExtensionErrorHandlers = new Map([
  [
    'warn',
    (image) => {
      console.warn(
        `'${image.name || image.fileName}' is not a valid '${path.extname(image.fileName)}' file.`,
      )
    },
  ],
  [
    'error',
    (image) => {
      throw new Error(
        `'${image.name || image.fileName}' is not a valid '${path.extname(image.fileName)}' file.`,
      )
    },
  ],
])

function createVitePluginImageMinify(options) {
  const cacheEnabled = options?.__test_enable_cache !== false
  let onFileExtensionError = options?.onFileExtensionError

  if (
    typeof onFileExtensionError === 'string' &&
    onFileExtensionErrorHandlers.has(onFileExtensionError)
  ) {
    onFileExtensionError =
      onFileExtensionErrorHandlers.get(onFileExtensionError)
  }

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
      await minifyWithSquoosh(bundle, {onFileExtensionError, cache})
      await minifySvg(bundle, {onFileExtensionError, cache})

      cache.writeFile()
    },
  }
}

export default createVitePluginImageMinify
