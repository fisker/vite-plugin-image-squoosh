import fs from 'node:fs'
import * as path from 'node:path'
import crypto from 'node:crypto'
import packageJson from './package-json-proxy.cjs'
import temporaryDirectory from 'temp-dir'
import iterateDirectoryUp from 'iterate-directory-up'

function hash(data) {
  return crypto.createHash('sha1').update(data).digest('hex')
}

function getCacheDirectory(viteConfig) {
  if (viteConfig.cacheDir) {
    return path.join(viteConfig.cacheDir, packageJson.name)
  }

  for (const directory of iterateDirectoryUp(viteConfig.root)) {
    if (fs.existsSync(path.join(directory, 'node_modules'))) {
      return path.join(directory, `node_modules/.cache/${packageJson.name}/`)
    }

    if (fs.existsSync(path.join(directory, '.git'))) {
      break
    }
  }

  return path.join(
    temporaryDirectory,
    `${packageJson.name}/${hash(viteConfig.root)}/`,
  )
}

class Cache {
  #root

  #cacheDirectory

  #metaFile

  #files

  #updated = new Map()

  constructor(viteConfig) {
    this.#root = viteConfig.root

    this.#cacheDirectory = getCacheDirectory(viteConfig)

    this.#metaFile = path.join(this.#cacheDirectory, 'meta.json')

    this.#files = this.#load() ?? new Set()
  }

  #load() {
    let data
    try {
      data = JSON.parse(fs.readFileSync(this.#metaFile))
    } catch {}

    if (
      !data ||
      data.version !== packageJson.version ||
      data.root !== this.#root ||
      !Array.isArray(data.files)
    ) {
      return
    }

    return new Set(data.files)
  }

  getCachedData(content) {
    if (!this.#files) return

    const contentHash = hash(content)

    if (!this.#files.has(contentHash)) {
      return
    }

    try {
      return fs.readFileSync(path.join(this.#cacheDirectory, contentHash))
    } catch {}
  }

  updateCache(content, data) {
    const contentHash = hash(content)
    this.#updated.set(contentHash, data)
  }

  writeFile() {
    fs.mkdirSync(this.#cacheDirectory, {recursive: true})

    for (const [contentHash, data] of this.#updated) {
      fs.writeFileSync(path.join(this.#cacheDirectory, contentHash), data)
    }

    fs.writeFileSync(
      this.#metaFile,
      JSON.stringify(
        {
          version: packageJson.version,
          root: this.#root,
          files: [...new Set([...this.#files, ...this.#updated.keys()])],
          time: new Date(),
        },
        undefined,
        2,
      ),
    )
  }
}

export default Cache
