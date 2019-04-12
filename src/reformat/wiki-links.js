// @flow

import { ContentMap } from '../content-map'

const isRelativeUrl = require('is-relative-url')
const visit = require('unist-util-visit')
const definitions = require('mdast-util-definitions')

export const hugoRef = (original: string) => {
  const hash = urlHash(original)
  const base = `{{% ref "${urlBase(original)}" %}}`
  if (hash) {
    return base + '#' + hash
  }
  return base
}

const urlBase = (url: string) => url.split('#')[0]
const urlHash = (url: string) => {
  const components = url.split('#', 2)
  return components.length > 1 ? components[1] : null
}

function rewriteWikiLinkTarget(url: string, contentMap: ContentMap) {
  const entry = contentMap.wikiTargetMap.get(urlBase(url))
  if (!entry) {
    return hugoRef(url)
  }

  const dest = hugoRef(contentMap.getOutputPath(entry.src))
  const hash = urlHash(url)
  if (hash) {
    return dest + '#' + hash
  }
  return dest
}

export default function wikiLinkPlugin(opts: {contentMap: ContentMap}) {
  const {contentMap} = opts

  return (tree: any) => {
    const definition = definitions(tree)

    const visitor = (node) => {
      const ctx = node.type === 'link' ? node : definition(node.identifier)
      if (!ctx) {
        return
      }

      // skip absolute references
      if (!isRelativeUrl(ctx.url)) {
        return
      }

      // skip local anchor links
      if (ctx.url.startsWith('#')) {
        return
      }

      ctx.url = rewriteWikiLinkTarget(ctx.url, contentMap)
    }

    visit(tree, ['link', 'linkReference'], visitor)
  }
}
