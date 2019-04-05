
const Joi = require('joi')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)

const sourceSchema = Joi.object().keys({
  src: Joi.string()
    .description("Path to input file, relative to root inputPath")
    .required(),
  dest: Joi.string()
    .description("Path to output file, relative to root outputPath. Defaults to `src`."),
  frontMatter: Joi.object()
    .description("An object to use as hugo front-matter.")
})

const configSchema = Joi.object().keys({
  inputPath: Joi.string()
    .description("Path to directory containing input docs. All `src` entries in `sources` are relative to this dir.")
    .required(),
  outputPath: Joi.string()
    .description("Path to directory to use for output. Will be created if it does not exist. All `dest` entries in `sources` are relative to this dir.")
    .required(),
  copyUnknownInputFiles: Joi.boolean()
    .description("If true, files that are not present in `sources` will be copied unchanged to the output directory.")
    .default(true),
  sources: Joi.array()
    .description("A collection of `source` objects containing paths to docs and metadata about them.")
    .items(sourceSchema)
    .default(() => [], "empty array")
}).required()


function validate(config) {
  const {error, value} = Joi.validate(config, configSchema)
  if (error) {
    throw error
  }
  return value
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
  constructor(...configObjects) {
    const merged = Object.assign({}, ...configObjects)
    this._config = validate(merged)
  }

  static async fromCommandLineArgs(argv) {
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
    return new SiteConfig(commandLineArgs)
  }

  static async fromJsonFile(filePath, commandLineOptions) {
    const content = await readFile(filePath, {encoding: 'utf-8'})
    return new SiteConfig(JSON.parse(content), commandLineOptions)
  }

  static async fromYamlFile(filePath, commandLineOptions) {
    const content = await readFile(filePath, {encoding: 'utf-8'})
    return new SiteConfig(yaml.safeLoad(content), commandLineOptions)
  }

  get inputPath() {
    return this._config.inputPath
  }

  get outputPath() {
    return this._config.outputPath
  }

  get copyUnknownInputFiles() {
    return this._config.copyUnknownInputFiles
  }

  _rewritePaths(sourceEntry) {
    const src = path.join(this.inputPath, sourceEntry.src)
    const dest = path.join(this.outputPath, sourceEntry.dest || sourceEntry.src)
    return {...sourceEntry, src, dest}
  }

  get sources () {
    const entries = this._config.sources || []
    return entries.map(e => this._rewritePaths(e))
  }

  get sourcesMap() {
    return new Map(this.sources.map(s => [s.src, s]))
  }

  get wikiLinkMap() {
    return new Map(this._config.sources.map(s => [path.basename(s.src, '.md'), s]))
  }

  sourceEntry(fullInputPath) {
    return this.sourcesMap.get(fullInputPath)
  }

}

module.exports = { SiteConfig }
