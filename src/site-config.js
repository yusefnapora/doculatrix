// @flow

import { ContentMap, ContentMapEntrySchema } from './content-map'
import { validate } from './util'
import type { ContentMapEntry } from './content-map'
import WikiConfig from './wiki/wiki-config'

const Joi = require('joi')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)

const SiteConfigSchema = Joi.object().keys({
  inputPath: Joi.string()
    .description("Path to directory containing input docs. All `src` entries in `sources` are relative to this dir.")
    .required(),
  outputPath: Joi.string()
    .description("Path to directory to use for output. Will be created if it does not exist. All `dest` entries in `sources` are relative to this dir.")
    .required(),

  wiki: Joi.object().keys({
    deriveContentMap: Joi.boolean().default(true),
    metadata: Joi.object()
  }),

  contentMap: Joi.array()
    .description("Describes how to map input files to output files")
    .items(ContentMapEntrySchema)
}).required()

interface SiteConfigOptions {
  inputPath: string,
  outputPath: string,
  wiki?: {
    deriveContentMap: boolean,
    metadata: Object
  },
  contentMap: Array<ContentMapEntry>
}

const fileExists = (filePath) => new Promise((resolve, reject) => {
  if (!filePath) {
    return resolve(false)
  }
  fs.access(filePath, fs.F_OK, (err) => {
    if (!err) {
      return resolve(true)
    }
    if (err.code === 'ENOENT') {
      return resolve(false)
    }
    reject(err)
  })
});

class SiteConfig {
  _config: SiteConfigOptions
  contentMap: ContentMap

  constructor(options: SiteConfigOptions) {
    this._config = validate(options, SiteConfigSchema)
    this.contentMap = new ContentMap(this._config.contentMap)
  }

  static async buildConfig(...configObjects: Array<Object>) {
    const merged = Object.assign({}, ...configObjects)
    const options = validate(merged, SiteConfigSchema)
    if (!options.wiki.deriveContentMap) {
      return new SiteConfig(options)
    }
    const wikiConfig = await WikiConfig.fromWikiDirectory(options.inputPath, options.wiki)
    return new SiteConfig({...options, contentMap: wikiConfig.contentMap, wikiConfig})
  }

  static async fromCommandLineArgs(argv: Object) {
    const {inputPath, outputPath} = argv
    const commandLineArgs = { inputPath, outputPath }
    const configFileExists = await fileExists(argv.config)
    if (configFileExists) {
      const ext = path.extname(argv.config).toLowerCase()
      if (ext === '.json') {
        return SiteConfig.fromJsonFile(argv.config, commandLineArgs)
      }
      if (ext === '.yaml' || ext == '.yml') {
        return SiteConfig.fromYamlFile(argv.config, commandLineArgs)
      }
    }
    return this.buildConfig(commandLineArgs)
  }

  static async fromJsonFile(filePath: string, commandLineOptions: Object) {
    const content = await readFile(filePath, {encoding: 'utf-8'})
    return this.buildConfig(JSON.parse(content), commandLineOptions)
  }

  static async fromYamlFile(filePath: string, commandLineOptions: Object) {
    const content = await readFile(filePath, {encoding: 'utf-8'})
    return this.buildConfig(yaml.safeLoad(content), commandLineOptions)
  }

  get inputPath(): string {
    return this._config.inputPath
  }

  get outputPath(): string {
    return this._config.outputPath
  }

  get isWiki(): boolean {
    return !!this._config.wiki
  }

  fullInputFilePath(relativeInputFilePath: string): string {
    return path.join(this.inputPath, relativeInputFilePath)
  }

  fullOutputFilePathForInputFile(relativeInputFilePath: string): string {
    return this.contentMap.getOutputPath(relativeInputFilePath, this.outputPath)
  }

}

module.exports = { SiteConfig }
