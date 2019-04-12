"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contentMapFromWikiConfigOptions = contentMapFromWikiConfigOptions;
exports.WikiConfigSchema = exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _joi = _interopRequireDefault(require("joi"));

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

var _contentMap = require("../content-map");

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var WikiConfig = function WikiConfig(options) {
  _classCallCheck(this, WikiConfig);

  this.options = (0, _util.validate)(options, WikiConfigSchema);
  this.contentMap = contentMapFromWikiConfigOptions(this.options);
};

exports.default = WikiConfig;

WikiConfig.fromWikiDirectory =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(inputDirectoryPath, options) {
    var fullFilePaths, inputDir, inputFilePaths;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _recursiveReaddir.default)(inputDirectoryPath);

          case 2:
            fullFilePaths = _context.sent;
            inputDir = _path.default.normalize(inputDirectoryPath);
            inputFilePaths = fullFilePaths.map(function (filePath) {
              return filePath.replace(inputDir, '');
            }).map(function (filePath) {
              return filePath.startsWith('/') ? filePath.substr(1) : filePath;
            }).filter(function (filePath) {
              return !filePath.startsWith('.');
            }).filter(function (filePath) {
              return !filePath.startsWith('_');
            });
            return _context.abrupt("return", new WikiConfig(_objectSpread({}, options, {
              inputFilePaths: inputFilePaths
            })));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Construct ContentMap from WikiConfig options.
 */


function contentMapFromWikiConfigOptions(options) {
  // TODO: for now, we assume that inputFilePaths are relative to the inputDirectoryPath. maybe revisit
  (0, _util.validate)(options, WikiConfigSchema);
  var metadata = options.metadata || {};
  var entries = options.inputFilePaths.map(function (filePath) {
    if (filePath.endsWith('.md')) {
      return markdownMapEntry(filePath, metadata[filePath]);
    }

    return {
      src: filePath,
      dest: _path.default.resolve('/', filePath)
    };
  });
  return new _contentMap.ContentMap(entries);
}

function sectionFromMarkdownPath(inputFilePath) {
  var slug = wikiTargetFromMarkdownPath(inputFilePath).toLowerCase();
  return "/".concat(slug, "/_index.md");
}

function defaultTitleFromMarkdownPath(inputFilePath) {
  return wikiTargetFromMarkdownPath(inputFilePath).replace(new RegExp('-', 'g'), ' ');
}

function wikiTargetFromMarkdownPath(inputFilePath) {
  return _path.default.basename(inputFilePath, '.md');
}

function destPathForMarkdownPath(inputFilePath) {
  if (wikiTargetFromMarkdownPath(inputFilePath) === 'Home') {
    return '/_index.md';
  }

  return sectionFromMarkdownPath(inputFilePath);
}

function markdownMapEntry(inputFilePath, metadataEntry) {
  return {
    src: inputFilePath,
    dest: destPathForMarkdownPath(inputFilePath),
    wikiTarget: wikiTargetFromMarkdownPath(inputFilePath),
    hugoFrontMatter: _objectSpread({
      title: defaultTitleFromMarkdownPath(inputFilePath)
    }, metadataEntry)
  };
}
/**
 * Constructor options for {@link WikiConfig}
 */


var WikiConfigSchema = _joi.default.object().keys({
  inputFilePaths: _joi.default.array().items(_joi.default.string()).description('File paths to all contents of inputDirectoryPath that should be used in the site.').required(),
  metadata: _joi.default.object()
}).unknown(true);

exports.WikiConfigSchema = WikiConfigSchema;