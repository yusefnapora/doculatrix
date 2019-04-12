// @flow

import type { ContentMapEntry } from '../content-map'
import { SiteConfig } from '../site-config'

const fs = require('fs')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const wikiLinks = require('./wiki-links')
const wikiImages = require('./wiki-images')

const path = require('path')
const yaml = require('js-yaml')

const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)

const mkdirp = promisify(require('mkdirp'))

async function ensureDirectoryExists(filePath) {
  return mkdirp(path.dirname(filePath))
}


async function processMarkdownContent(content, contentMap) {
  return new Promise((resolve, reject) => {
    unified()
      .use(parse)
      .use(stringify)
      .use(wikiLinks, {contentMap})
      .use(wikiImages)
      .process(content, (err, file) => {
        if (err) {
          return reject(err)
        }
        return resolve(String(file))
      })
  })
}

async function processMarkdownEntry(entry: ContentMapEntry, siteConfig: SiteConfig) {
  const content = await readFile(siteConfig.fullInputFilePath(entry.src), {encoding: 'utf-8'})
  const processed = await processMarkdownContent(content, siteConfig.contentMap)

  let fullContent = ''
  if (entry.hugoFrontMatter) {
    fullContent = yaml.safeDump(entry.hugoFrontMatter) + '\n'
  }
  fullContent += processed

  const dest = siteConfig.fullOutputFilePathForInputFile(entry.src)

  console.info('writing processed input file ' + entry.src + ' to ' + dest)
  await writeFile(dest, fullContent)
}

async function copyEntry(entry: ContentMapEntry, siteConfig: SiteConfig) {
  return copyFile(
    siteConfig.fullInputFilePath(entry.src),
    siteConfig.fullOutputFilePathForInputFile(entry.src))
}

function isMarkdown(entry: ContentMapEntry): boolean {
  return entry.src.endsWith('.md')
}

async function processSite(siteConfig: SiteConfig) {
  const promises = [ensureDirectoryExists(siteConfig.outputPath)]

  siteConfig.contentMap.entries.forEach(entry => {
    if (isMarkdown(entry)) {
      promises.push(processMarkdownEntry(entry, siteConfig))
    } else {
      promises.push(copyEntry(entry, siteConfig))
    }
  })

  return Promise.all(promises)
}

module.exports = { processSite }
