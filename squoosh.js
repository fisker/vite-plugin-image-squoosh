import * as path from 'node:path'
import os from 'node:os'

const encoders = new Map([
  ['.jpg', 'mozjpeg'],
  ['.jpeg', 'mozjpeg'],
  ['.png', 'oxipng'],
])

function getEncoder(filename) {
  return encoders.get(path.extname(filename).toLowerCase())
}

/**
 * @param {{content: Buffer, name: string}[]} files
 * @returns {}
 */
async function squooshImages(files) {
  if (files.length === 0) {
    return []
  }

  const {ImagePool} = await import('@frostoven/libsquoosh')
  const imagePool = new ImagePool(os.cpus().length)

  let result

  try {
    result = await Promise.all(
      files.map(async ({content: original, name}) => {
        const encoder = getEncoder(name)
        if (!encoder) {
          return original
        }
        const image = imagePool.ingestImage(original)
        await image.encode({[encoder]: {}})
        const result = await image.encodedWith[encoder]
        const compressed = result.binary
        return compressed.length < original.length ? compressed : original
      }),
    )
  } finally {
    imagePool.close()
  }

  return result
}

const isSupportedImage = (filename) => Boolean(getEncoder(filename))

export {squooshImages, isSupportedImage}
