// @flow

import path from 'path'
import Joi from 'joi'
import readDir from 'recursive-readdir'

import { ContentMap } from '../content-map'
import { validate } from '../util'
import type { ContentMapEntry } from '../content-map'


/**
 * A WikiConfig is plan for transforming a clone of a github
 * wiki repository into a directory full of Markdown files
 * and images that are structured in a way that Hugo likes.
 *
 * The idea is that all markdown files in the wiki repo are
 * treated as Hugo "sections", which makes them show up in
 * the side menu of most themes and generally makes navigation
 * work the way Hugo expects.
 *
 * The exception are the special files `Home.md` and `_Footer.md`.
 * `Home.md` gets turned into Hugo's index page, so it's what renders
 * at the `/` route of the generated site.
 *
 * I haven't decided what to do with `_Footer.md` yet - I think making
 * the content available as a Hugo variable would be cool, so
 * you could put it into a part of the site layout that makes sense.
 * TODO: figure this out ^^
 *
 * ### Arguments
 *
 * The required arguments for a `WikiConfig` are an `inputFilePaths` array,
 * which contains the path of every item underneath `inputDirectoryPaths` that
 * you want to include, including things like images that you just want to copy
 * without modification. See below for async helper methods to read those paths
 * from the filesystem.
 *
 * You can also optionally give a `metadata` map argument that lets you
 * set Hugo specific metadata, which gets prepended (by a different module)
 * to the source file as Hugo "front matter" in yaml format during the output
 * generation phase.
 *
 * The `metadata` map should look like this:
 *
 * ```javascript
 * {
 *   "Getting-Started.md": {
 *     "title": "Getting Started with Filecoin",
 *     "weight": 1,
 *     "pre": "<i class='a-fancy-icon-font-thing'></i> "
 *   }
 * }
 * ```
 *
 * If you don't give any metadata for a given filename or don't
 * provide a `title` field, we'll generate a default `title` field
 * by "de-slugging" the filename. So e.g. `Getting-Started.md` would
 * become `Getting Started` and so on.
 *
 * Hugo sorts the entries in the navigation menu by the `weight`
 * metadata field. If it's missing, it will fall back to sorting
 * lexicographically (I think... I don't know if it tries to do any
 * fancy localization).
 *
 * You can put whatever you want in the metadata dictionary. The only
 * thing we care about is that it's a valid JS object. We also check
 * for the existence of a `title` field as described above.
 *
 * ### About links & images
 *
 * This config class isn't responsible for rewriting links, but
 * it does expose a {@link ContentMap} object that can be used
 * by the rewriting module to rewrite links correctly.
 *
 * In fact, the entire point of this class is to construct a
 * ContentMap from a wiki source repo, but this was pulled into
 * a class to make it a bit easier to pass around and examine
 * the options, etc.
 *
 *
 * ### Usage & async considerations
 *
 * The constructor is synchronous by nature, but the intended
 * usage for this class is to derive much of the config from
 * the filesystem. Examining the filesystem is async, so we do
 * that outside the constructor in static async helper methods:
 *
 * @link WikiConfig.fromWikiDirectory
 *
 * These will scan the filesystem and give the constructor an array
 * of input file paths for all the content discovered.
 */
export default class WikiConfig {
  static fromWikiDirectory: (inputDirectoryPath: string, options: {}) => Promise<WikiConfig>

  options: WikiConfigOptions
  contentMap: ContentMap

  constructor (options: WikiConfigOptions) {
    this.options = validate(options, WikiConfigSchema)
    this.contentMap = contentMapFromWikiConfigOptions(this.options)
  }
}

WikiConfig.fromWikiDirectory = async (inputDirectoryPath: string, options: {}) => {
  const fullFilePaths = await readDir(inputDirectoryPath)
  const inputDir = path.normalize(inputDirectoryPath)
  const inputFilePaths = fullFilePaths
    .map(filePath => filePath.replace(inputDir, ''))
    .map(filePath => filePath.startsWith('/') ? filePath.substr(1) : filePath)
    .filter(filePath => !filePath.startsWith('.'))
    .filter(filePath => !filePath.startsWith('_'))

  return new WikiConfig({...options, inputFilePaths})
}

/**
 * Construct ContentMap from WikiConfig options.
 */
export function contentMapFromWikiConfigOptions(options: WikiConfigOptions): ContentMap {
  // TODO: for now, we assume that inputFilePaths are relative to the inputDirectoryPath. maybe revisit

  validate(options, WikiConfigSchema)
  const metadata = options.metadata || {}
  const entries = options.inputFilePaths.map(filePath => {
    if (filePath.endsWith('.md')) {
      return markdownMapEntry(filePath, metadata[filePath])
    }
    return {
      src: filePath,
      dest: path.resolve('/', filePath)
    }
  })
  return new ContentMap(entries)
}

function sectionFromMarkdownPath(inputFilePath: string): string {
  const slug = wikiTargetFromMarkdownPath(inputFilePath)
    .toLowerCase()
  return `/${slug}/_index.md`
}

function defaultTitleFromMarkdownPath(inputFilePath: string): string {
  return wikiTargetFromMarkdownPath(inputFilePath)
    .replace(new RegExp('-', 'g'), ' ')
}

function wikiTargetFromMarkdownPath(inputFilePath: string): string {
  return path.basename(inputFilePath, '.md')
}

function destPathForMarkdownPath(inputFilePath: string): string {
  if (wikiTargetFromMarkdownPath(inputFilePath) === 'Home') {
    return '/_index.md'
  }
  return sectionFromMarkdownPath(inputFilePath)
}

function markdownMapEntry(inputFilePath: string, metadataEntry: ?Object): ContentMapEntry {

  return {
    src: inputFilePath,
    dest: destPathForMarkdownPath(inputFilePath),
    wikiTarget: wikiTargetFromMarkdownPath(inputFilePath),
    hugoFrontMatter: {
      title: defaultTitleFromMarkdownPath(inputFilePath),
      ...metadataEntry
    }
  }
}

/**
 * Constructor options for {@link WikiConfig}
 */
interface WikiConfigOptions {

  /**
   *   Array of file paths to all contents of `inputDirectoryPath`
   *   that should be used in the generated site. Should include all images, etc.
   */
  inputFilePaths: Array<string>,

  /**
   * A map of file paths (relative to `inputDirectoryPath`, and without that path as a prefix) to
   * an object to use as Hugo front matter for the file at that input path.
   */
  metadata?: { [string]: any }
}

export const WikiConfigSchema = Joi.object()
  .keys({
    inputFilePaths: Joi.array()
      .items(Joi.string())
      .description('File paths to all contents of inputDirectoryPath that should be used in the site.')
      .required(),

    metadata: Joi.object()
  }).unknown(true)