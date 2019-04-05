const fs = require('fs')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const wikiLinks = require('./wiki-links')
const wikiImages = require('./wiki-images')

const path = require('path')
const yaml = require('js-yaml')
const readDir = require('recursive-readdir')

const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)

const mkdirp = promisify(require('mkdirp'))

async function ensureDirectoryExists(filePath) {
  return mkdirp(path.dirname(filePath))
}


async function processMarkdownContent(content, siteConfig) {
  return new Promise((resolve, reject) => {
    unified()
      .use(parse)
      .use(stringify)
      .use(wikiLinks)
      .use(wikiImages)
      .process(content, (err, file) => {
        if (err) {
          return reject(err)
        }
        return resolve(String(file))
      })
  })
}


async function processSourceEntry(entry, siteConfig) {
  const {src, dest, frontMatter} = entry
  const content = await readFile(src, {encoding: 'utf-8'})
  const processed = await processMarkdownContent(content, siteConfig)

  let serializedFrontMatter = ""
  if (frontMatter) {
    serializedFrontMatter = '---\n' + yaml.safeDump(frontMatter) + '---\n'
  }

  const fullContent = serializedFrontMatter + '\n' + processed

  await ensureDirectoryExists(dest)
  return writeFile(dest, fullContent, {encoding: 'utf-8'})
}

async function copyUnknown(filePath, siteConfig) {
  if (!siteConfig.copyUnknownInputFiles) {
    console.log('not copying unknown file ', filePath)
    return
  }
  const relative = path.relative(siteConfig.inputPath, filePath)
  const dest = path.join(siteConfig.outputPath, relative)
  await ensureDirectoryExists(dest)
  console.log('copying ', filePath, ' to ', dest)
  return copyFile(filePath, dest)
}

async function processSite(siteConfig) {
  const files = await readDir(siteConfig.inputPath)
  const promises = []

  for (const f of files) {
    const entry = siteConfig.sourceEntry(f)

    if (entry) {
      promises.push(processSourceEntry(entry, siteConfig))
    } else {
      promises.push(copyUnknown(f, siteConfig))
    }
  }

  return Promise.all(promises)
}

module.exports = { processSite }
