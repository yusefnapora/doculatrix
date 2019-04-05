const {URL} = require('url')
const path = require('path')
const isRelativeUrl = require('is-relative-url')
const visit = require('unist-util-visit')
const definitions = require('mdast-util-definitions')

const defaultExtensions = ['js', 'ts', 'go', 'rs', 'java', 'kt', 'cs']

const hugofyLink = (ctx) => {
  const original = ctx.url
  ctx.url = `{{% relref "${original}" %}}`
}

const absoluteLinkify = (options = {}) => {
  const baseUrl = options.baseUrl
  if (!baseUrl) {
    return new Error('Missing required option `baseUrl`')
  }

  const extensions = options.extensions || defaultExtensions

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

      const absolute = new URL(ctx.url, baseUrl)
      const extension = path.extname(absolute.pathname)
        .split('.').pop().toLowerCase()

      if (extension === 'md') {
        hugofyLink(ctx)
        return
      }

      if (extensions.indexOf(extension) == -1) {
        return
      }

      ctx.url = absolute.toString()
    }

    visit(tree, ['link', 'linkReference'], visitor)
  }
}

module.exports = absoluteLinkify
