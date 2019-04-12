"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
 * `Home.md` get turned into Hugo's index page, so it's what renders
 * at the `/` route of the generated site.
 *
 * I haven't decided what to do with `_Footer.md` yet - I think making
 * the content available as a Hugo variable would be cool, so
 * you could put it into a part of the site layout that makes sense.
 * TODO: figure this out ^^
 *
 * ### Arguments
 *
 * The required arguments for a `WikiConfig` are the `inputPath`
 * of a local wiki repo clone and the `outputPath` where the
 * transformed files should go. Note that `outputPath` is *not*
 * the generated site - it is the massaged Markdown source that
 * gets fed into Hugo as *input* to generate the site.
 *
 * You can optionally give a `metadata` map argument that lets you
 * set Hugo specific metadata, which gets prepended to the source
 * file as Hugo "front matter" in yaml format.
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
 * it does expose the information needed by the rewriter, using
 * the `getOutputPathForWikiLink(linkTarget)` method. When the
 * rewriter encounters a wiki-style link, that method will either
 * return the new URL to link to or the original unaltered link
 * target if no match is found.
 *
 * Images embedded using wiki syntax, e.g. `[[/images/foo.png|Alt text about foo]]`
 * can likewise be handled by a separate plugin, using the lookup
 * described above. See the docs for that method for more.
 * TODO: link to jsdoc
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
var WikiConfig =
/*#__PURE__*/
function () {
  function WikiConfig(options) {
    _classCallCheck(this, WikiConfig);
  }

  _createClass(WikiConfig, null, [{
    key: "fromWikiDirectory",
    value: function () {
      var _fromWikiDirectory = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(inputDirPath, options) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fromWikiDirectory(_x, _x2) {
        return _fromWikiDirectory.apply(this, arguments);
      }

      return fromWikiDirectory;
    }()
  }]);

  return WikiConfig;
}();

exports.default = WikiConfig;