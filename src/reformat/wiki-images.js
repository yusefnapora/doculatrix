
const IMAGE_REGEX = /^\[\[(.+)\]\]/


function locator (value, fromIndex) {
  return value.indexOf('[', fromIndex)
}

function wikiImagePlugin() {
  function inlineTokenizer(eat, value) {
    const match = IMAGE_REGEX.exec(value);

    if (!match) {
      return
    }

    const fullMatch = match[0]
    const [imageUrl, altText] = match[1].split('|')

    return eat(fullMatch)({
      type: 'image',
      url: imageUrl,
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