// @flow

import { ContentMap } from '../content-map'

const isRelativeUrl = require('is-relative-url')
const visit = require('unist-util-visit')
const definitions = require('mdast-util-definitions')

export const hugoRef = (original) => `{{% ref "${original}" %}}`

function rewriteWikiLinkTarget(url: string, contentMap: ContentMap) {
  if (contentMap.wikiTargetMap.has(url)) {
    return hugoRef(url)
  }

  const entry = contentMap.wikiTargetMap.get(url)
  const dest = contentMap.getOutputPath(entry.src)
  return hugoRef(dest)
}

function wikiLinkPlugin(opts: {contentMap: ContentMap}) {
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

module.exports = wikiLinkPlugin
