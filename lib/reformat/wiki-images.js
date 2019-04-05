"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var IMAGE_REGEX = /^\[\[(.+)\]\]/;

function locator(value, fromIndex) {
  return value.indexOf('[', fromIndex);
}

function wikiImagePlugin() {
  function inlineTokenizer(eat, value) {
    var match = IMAGE_REGEX.exec(value);

    if (!match) {
      return;
    }

    var fullMatch = match[0];

    var _match$1$split = match[1].split('|'),
        _match$1$split2 = _slicedToArray(_match$1$split, 2),
        imageUrl = _match$1$split2[0],
        altText = _match$1$split2[1];

    return eat(fullMatch)({
      type: 'image',
      url: imageUrl,
      alt: altText
    });
  }

  inlineTokenizer.locator = locator;
  var Parser = this.Parser;
  var inlineTokenizers = Parser.prototype.inlineTokenizers;
  var inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.wikiImage = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('link'), 0, 'wikiImage');
}

module.exports = wikiImagePlugin;