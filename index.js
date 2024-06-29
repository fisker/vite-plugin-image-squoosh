import assert from 'node:assert/strict'
import {isSupporttedImage, squooshImages} from './squoosh.js'

/**
 * @type {import('vite').Plugin}
 */
const vitePluginImageSquoosh = {
  name: 'vite-plugin-image-squoosh',
  apply: 'build',
  async generateBundle(_options, bundle) {
    /** @type {import('vite').Rollup.OutputAsset[]} */
    const images = Object.entries(bundle)
      .filter(([fileName, assetOrChunk]) => {
        assert.equal(fileName, assetOrChunk.fileName, 'Unexpected asset')
        return (
          assetOrChunk.type === 'asset' &&
          isSupporttedImage(assetOrChunk.fileName)
        )
      })
      .map(([, image]) => image)

    if (images.length === 0) {
      return
    }

    const compressed = await squooshImages(
      images.map((image) => ({content: image.source, name: image.fileName})),
    )

    for (const [index, image] of images.entries()) {
      bundle[image.fileName].source = compressed[index]
    }
  },
}

const createVitePluginImageSquoosh = () => vitePluginImageSquoosh

export default createVitePluginImageSquoosh
