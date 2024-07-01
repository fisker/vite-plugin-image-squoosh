/** @import * as Vite from 'vite' */

/**
@param {import('vite').Rollup.OutputBundle} bundle
@param {(filename: string) => boolean}
@yields {import('vite').Rollup.OutputAsset}
*/
function* getAssets(bundle, predicate) {
  for (const [filename, assetOrChunk] of Object.entries(bundle)) {
    if (assetOrChunk.type === 'asset' && predicate(filename)) {
      yield assetOrChunk
    }
  }
}

function isSvgFile(name) {
  return /\.svg$/i.test(name)
}

export {getAssets, isSvgFile}
