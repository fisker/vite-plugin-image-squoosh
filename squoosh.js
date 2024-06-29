import module from 'node:module'
import * as path from 'node:path'
import url from 'node:url'
import os from 'node:os'
import fs from 'node:fs/promises'

const LIB_SQUOOSH_HACK_CODE = 'var fetch;'

async function importLibrarySquoosh() {
  const libsquooshEntry = module
    .createRequire(import.meta.url)
    .resolve('@frostoven/libsquoosh')
  const content = await fs.readFile(libsquooshEntry, 'utf8')

  if (!content.startsWith(LIB_SQUOOSH_HACK_CODE)) {
    await fs.writeFile(libsquooshEntry, LIB_SQUOOSH_HACK_CODE + content)
  }

  return import(url.pathToFileURL(libsquooshEntry).href)
}

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

  const {ImagePool} = await importLibrarySquoosh()
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

const isSupporttedImage = (filename) => Boolean(getEncoder(filename))

export {squooshImages, isSupporttedImage}
