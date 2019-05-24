const isRelativeUrl = require('is-relative-url')

const IMAGE_REGEX = /^\[\[(.+)\]\]/

const hugoRef = (base, url) => {
  if (isRelativeUrl(url)) {
    return `${base}/${url}`
  }
  return url
}

function locator (value, fromIndex) {
  return value.indexOf('[', fromIndex)
}

function wikiImagePlugin(opts = {baseURL: "/"}) {
  const {baseURL} = opts
  function inlineTokenizer(eat, value) {
    const match = IMAGE_REGEX.exec(value);

    if (!match) {
      return
    }

    const fullMatch = match[0]
    const [imageUrl, altText] = match[1].split('|')

    return eat(fullMatch)({
      type: 'image',
      url: hugoRef(baseURL, imageUrl),
      alt: altText
    });

  }

  inlineTokenizer.locator = locator

  const Parser = this.Parser

  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.wikiImage = inlineTokenizer
  inlineMethods.splice(inlineMethods.indexOf('link'), 0, 'wikiImage')
}

module.exports = wikiImagePlugin