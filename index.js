import assert from 'node:assert/strict'
import {isSupportedImage, squooshImages} from './squoosh.js'
import optimizeSvg from './svgo.js'

async function minifyWithSquoosh(bundle) {
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
  )

  for (const [index, image] of images.entries()) {
    bundle[image.fileName].source = compressed[index]
  }
}

async function minifySvg(bundle) {
  /** @type {import('vite').Rollup.OutputAsset[]} */
  const images = Object.values(bundle).filter(
    (assetOrChunk) =>
      assetOrChunk.type === 'asset' && /\.svg$/i.test(assetOrChunk.fileName),
  )

  for (const {fileName: name, source: content} of images) {
    bundle[name].source = optimizeSvg(content)
  }
}

/**
 * @type {import('vite').Plugin}
 */
const vitePluginImageMinify = {
  name: 'vite-plugin-image-minify',
  apply: 'build',
  async generateBundle(_options, bundle) {
    for (const [fileName, assetOrChunk] of Object.entries(bundle)) {
      assert.equal(fileName, assetOrChunk.fileName, 'Unexpected asset')
    }

    await minifyWithSquoosh(bundle)
    await minifySvg(bundle)
  },
}

const createVitePluginImageMinify = () => vitePluginImageMinify

export default createVitePluginImageMinify
