// @flow

import path from 'path'
import { ContentMap } from '../content-map'
import type { ContentMapEntry } from '../content-map'

import readDir from 'recursive-readdir'

function wikiTarget(filePath: string): ?string {
  if (! filePath.endsWith('.md')) {
    return null
  }
  return path.basename(filePath)
}

function fileDestination(filePath: string): string {
  if (! filePath.endsWith('.md')) {
    return filePath
  }
  const section = path.basename(filePath).toLowerCase()
  return path.join(section, '_index.md')
}

const entryForWikiFile = (filePath: string): ContentMapEntry => ({
  src: filePath,
  dest: fileDestination(filePath),

})

export function contentMapFromWikiFiles(filePaths: Array<string>): Promise<ContentMap> {
  return Promise.reject(new Error('Not implemented yet'))
}

