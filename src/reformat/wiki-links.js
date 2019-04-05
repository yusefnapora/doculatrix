const {URL} = require('url')
const isRelativeUrl = require('is-relative-url')
const visit = require('unist-util-visit')
const definitions = require('mdast-util-definitions')

const hugoRef = (original) => `{{% ref "${original}" %}}`

const WIKI_ENTRY_REGEX = /^[A-Z]+.*(?!\..*)$/

function rewriteWikiLinkTarget(url) {
  if (!url.match(WIKI_ENTRY_REGEX)) {
    return hugoRef(url)
  }

  const u = new URL(url, 'file://')
  const dir = u.pathname.toLowerCase()
  const target = `${dir}/_index.md` + u.search + u.hash

  return hugoRef(target)
}

function wikiLinkPlugin() {
  return (tree) => {
    const definition = definitions(tree)

    const visitor = (node) => {
      const ctx = node.type === 'link' ? node : definition(node.identifier)
      if (!ctx) {
        return
      }

      if (!isRelativeUrl(ctx.url)) {
        return
      }

      if (ctx.url.startsWith('#')) {
        return
      }

      ctx.url = rewriteWikiLinkTarget(ctx.url)
    }

    visit(tree, ['link', 'linkReference'], visitor)
  }
}

module.exports = wikiLinkPlugin
