// @flow

import { validate } from './util'

const path = require('path')
const Joi = require('joi')

export interface HugoFrontMatter {
  title?: string,
  menuTitle?: string,
  weight?: number,
  pre?: string,
  post?: string
}

export interface ContentMapEntry {
  src: string,
  dest?: string,
  wikiTarget?: string,
  hugoFrontMatter?: HugoFrontMatter
}

export class ContentMap {
  entries: Array<ContentMapEntry>
  sourceMap: Map<string, ContentMapEntry>
  wikiTargetMap: Map<string, ContentMapEntry>

  constructor(entries: Array<ContentMapEntry>) {
    this.entries = validateEntries(entries)
    this.sourceMap = buildSourceMap(this.entries)
    this.wikiTargetMap = buildWikiTargetMap(this.entries)
  }

  getOutputPath(inputFile: string, outputRoot: string = '') {
    const entry = this.sourceMap.get(inputFile)
    if (!entry) {
      return path.join(outputRoot, inputFile)
    }
    const { src, dest } = entry
    return path.join(outputRoot, path.normalize(dest || src))
  }
}


// region validation

const HugoFrontMatterSchema = Joi.object().keys({
  title: Joi.string().description("Hugo page title"),
  menuTitle: Joi.string().description("Title to use in side menu, if different from `title`"),
  weight: Joi.number()
    .description("Where to position page in side menu relative to others. Lower == closer to the top."),
  pre: Joi.string().description("Optional HTML content to put before side menu entry"),
  post: Joi.string().description("Optional HTML content to put after side menu entry")
}).unknown(true)

export const ContentMapEntrySchema = Joi.object().keys({
  src: Joi.string()
    .description("Path to input file, relative to root inputPath")
    .required(),
  dest: Joi.string()
    .description("Path to output file, relative to root outputPath. Defaults to `src`."),
  wikiTarget: Joi.string()
    .description("The string used as a link target for this file in github-style wikis."),
  hugoFrontMatter: HugoFrontMatterSchema
}).unknown(true)

const validateMapEntry = (entry: any): ContentMapEntry => validate(entry, ContentMapEntrySchema)
const validateEntries = (entries: Array<any>): Array<ContentMapEntry> => entries.map(validateMapEntry)

function buildSourceMap(entries: Array<ContentMapEntry>): Map<string, ContentMapEntry> {
  const m = new Map()
  entries.forEach(e => {
    const key = path.normalize(e.src)
    if (m.has(key)) {
      throw new Error('Duplicate entry with src: ' + key)
    }
    m.set(key, e)
  })
  return m
}

function buildWikiTargetMap(entries: Array<ContentMapEntry>): Map<string, ContentMapEntry> {
  const m = new Map()
  entries.forEach(e => {
    if (!e.wikiTarget) {
      return
    }
    const key = path.normalize(e.wikiTarget)
    if (m.has(key)) {
      throw new Error('Duplicate entry with wikiTarget: ' + key)
    }
    m.set(key, e)
  })
  return m
}

// endregion validation
