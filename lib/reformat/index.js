"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _util = require("util");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _unified = _interopRequireDefault(require("unified"));

var _remarkParse = _interopRequireDefault(require("remark-parse"));

var _remarkStringify = _interopRequireDefault(require("remark-stringify"));

var _wikiLinks = _interopRequireDefault(require("./wiki-links"));

var _wikiImages = _interopRequireDefault(require("./wiki-images"));

var _siteConfig = require("../site-config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var readFile = (0, _util.promisify)(_fs.default.readFile);
var writeFile = (0, _util.promisify)(_fs.default.writeFile);
var copyFile = (0, _util.promisify)(_fs.default.copyFile);
var mkdirp = (0, _util.promisify)(require('mkdirp'));

function ensureDirectoryExists(_x) {
  return _ensureDirectoryExists.apply(this, arguments);
}

function _ensureDirectoryExists() {
  _ensureDirectoryExists = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(filePath) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", mkdirp(_path.default.dirname(filePath)));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _ensureDirectoryExists.apply(this, arguments);
}

function processMarkdownContent(_x2, _x3) {
  return _processMarkdownContent.apply(this, arguments);
}

function _processMarkdownContent() {
  _processMarkdownContent = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(content, contentMap) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              (0, _unified.default)().use(_remarkParse.default).use(_remarkStringify.default).use(_wikiLinks.default, {
                contentMap: contentMap
              }).use(_wikiImages.default).process(content, function (err, file) {
                if (err) {
                  return reject(err);
                }

                return resolve(String(file));
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _processMarkdownContent.apply(this, arguments);
}

function prependFrontMatter(content, frontMatter) {
  if (!frontMatter) {
    return content;
  }

  return '---\n' + _jsYaml.default.safeDump(frontMatter, {
    noCompatMode: true
  }) + '---\n\n' + content;
}

function processMarkdownEntry(_x4, _x5) {
  return _processMarkdownEntry.apply(this, arguments);
}

function _processMarkdownEntry() {
  _processMarkdownEntry = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(entry, siteConfig) {
    var inputFilePath, content, processed, fullContent, dest;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('processMarkdownEntry ', entry);
            inputFilePath = siteConfig.fullInputFilePath(entry.src);
            _context3.next = 4;
            return readFile(inputFilePath, {
              encoding: 'utf-8'
            });

          case 4:
            content = _context3.sent;
            _context3.next = 7;
            return processMarkdownContent(content, siteConfig.contentMap);

          case 7:
            processed = _context3.sent;
            fullContent = prependFrontMatter(processed, entry.hugoFrontMatter);
            dest = siteConfig.fullOutputFilePathForInputFile(entry.src);
            console.info('writing processed input file ' + inputFilePath + ' to ' + dest);
            _context3.next = 13;
            return ensureDirectoryExists(dest);

          case 13:
            _context3.next = 15;
            return writeFile(dest, fullContent);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _processMarkdownEntry.apply(this, arguments);
}

function copyEntry(_x6, _x7) {
  return _copyEntry.apply(this, arguments);
}

function _copyEntry() {
  _copyEntry = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(entry, siteConfig) {
    var outputFilePath;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            outputFilePath = siteConfig.fullOutputFilePathForInputFile(entry.src);
            _context4.next = 3;
            return ensureDirectoryExists(outputFilePath);

          case 3:
            return _context4.abrupt("return", copyFile(siteConfig.fullInputFilePath(entry.src), outputFilePath));

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _copyEntry.apply(this, arguments);
}

function isMarkdown(entry) {
  return entry.src.endsWith('.md');
}

function processSite(_x8) {
  return _processSite.apply(this, arguments);
}

function _processSite() {
  _processSite = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(siteConfig) {
    var promises;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            promises = [];
            promises.push(ensureDirectoryExists(siteConfig.outputPath));
            siteConfig.contentMap.entries.forEach(function (entry) {
              if (isMarkdown(entry)) {
                promises.push(processMarkdownEntry(entry, siteConfig));
              } else {
                promises.push(copyEntry(entry, siteConfig));
              }
            });
            return _context5.abrupt("return", Promise.all(promises));

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _processSite.apply(this, arguments);
}

module.exports = {
  processSite: processSite
};