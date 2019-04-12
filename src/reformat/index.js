// @flow

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import yaml from 'js-yaml'

import unified from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import wikiLinks from'./wiki-links'
import wikiImages from './wiki-images'

import type { ContentMapEntry } from '../content-map'
import { SiteConfig } from '../site-config'


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

function prependFrontMatter(content: string, frontMatter: Object): string {
  if (!frontMatter) {
    return content
  }
  return '---\n' + yaml.safeDump(frontMatter, {noCompatMode: true}) + '---\n\n' + content
}


async function processMarkdownEntry(entry: ContentMapEntry, siteConfig: SiteConfig) {
  console.log('processMarkdownEntry ', entry)
  const inputFilePath = siteConfig.fullInputFilePath(entry.src)
  const content = await readFile(inputFilePath, {encoding: 'utf-8'})
  const processed = await processMarkdownContent(content, siteConfig.contentMap)
  const fullContent = prependFrontMatter(processed, entry.hugoFrontMatter)
  const dest = siteConfig.fullOutputFilePathForInputFile(entry.src)

  console.info('writing processed input file ' + inputFilePath + ' to ' + dest)
  await ensureDirectoryExists(dest)
  await writeFile(dest, fullContent)
}

async function copyEntry(entry: ContentMapEntry, siteConfig: SiteConfig) {
  const outputFilePath = siteConfig.fullOutputFilePathForInputFile(entry.src)
  await ensureDirectoryExists(outputFilePath)

  return copyFile(siteConfig.fullInputFilePath(entry.src), outputFilePath)
}

function isMarkdown(entry: ContentMapEntry): boolean {
  return entry.src.endsWith('.md')
}

async function processSite(siteConfig: SiteConfig) {
  const promises = []

  promises.push(ensureDirectoryExists(siteConfig.outputPath))
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
