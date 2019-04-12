"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentMapEntrySchema = exports.ContentMap = void 0;

var _util = require("./util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var path = require('path');

var Joi = require('joi');

var ContentMap =
/*#__PURE__*/
function () {
  function ContentMap(entries) {
    _classCallCheck(this, ContentMap);

    this.entries = validateEntries(entries);
    this.sourceMap = buildSourceMap(this.entries);
    this.wikiTargetMap = buildWikiTargetMap(this.entries);
  }

  _createClass(ContentMap, [{
    key: "getOutputPath",
    value: function getOutputPath(inputFile) {
      var outputRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var entry = this.sourceMap.get(inputFile);

      if (!entry) {
        return path.join(outputRoot, inputFile);
      }

      var src = entry.src,
          dest = entry.dest;
      return path.join(outputRoot, path.normalize(dest || src));
    }
  }]);

  return ContentMap;
}(); // region validation


exports.ContentMap = ContentMap;
var HugoFrontMatterSchema = Joi.object().keys({
  title: Joi.string().description("Hugo page title"),
  menuTitle: Joi.string().description("Title to use in side menu, if different from `title`"),
  weight: Joi.number().description("Where to position page in side menu relative to others. Lower == closer to the top."),
  pre: Joi.string().description("Optional HTML content to put before side menu entry"),
  post: Joi.string().description("Optional HTML content to put after side menu entry")
}).unknown(true);
var ContentMapEntrySchema = Joi.object().keys({
  src: Joi.string().description("Path to input file, relative to root inputPath").required(),
  dest: Joi.string().description("Path to output file, relative to root outputPath. Defaults to `src`."),
  wikiTarget: Joi.string().description("The string used as a link target for this file in github-style wikis."),
  hugoFrontMatter: HugoFrontMatterSchema
}).unknown(true);
exports.ContentMapEntrySchema = ContentMapEntrySchema;

var validateMapEntry = function validateMapEntry(entry) {
  return (0, _util.validate)(entry, ContentMapEntrySchema);
};

var validateEntries = function validateEntries(entries) {
  return entries.map(validateMapEntry);
};

function buildSourceMap(entries) {
  var m = new Map();
  entries.forEach(function (e) {
    var key = path.normalize(e.src);

    if (m.has(key)) {
      throw new Error('Duplicate entry with src: ' + key);
    }

    m.set(key, e);
  });
  return m;
}

function buildWikiTargetMap(entries) {
  var m = new Map();
  entries.forEach(function (e) {
    if (!e.wikiTarget) {
      return;
    }

    var key = path.normalize(e.wikiTarget);

    if (m.has(key)) {
      throw new Error('Duplicate entry with wikiTarget: ' + key);
    }

    m.set(key, e);
  });
  return m;
} // endregion validation