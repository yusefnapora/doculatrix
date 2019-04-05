"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fs = require('fs');

var unified = require('unified');

var parse = require('remark-parse');

var stringify = require('remark-stringify');

var wikiLinks = require('./wiki-links');

var wikiImages = require('./wiki-images');

var path = require('path');

var yaml = require('js-yaml');

var readDir = require('recursive-readdir');

var _require = require('util'),
    promisify = _require.promisify;

var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);
var copyFile = promisify(fs.copyFile);
var mkdirp = promisify(require('mkdirp'));

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
            return _context.abrupt("return", mkdirp(path.dirname(filePath)));

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
  regeneratorRuntime.mark(function _callee2(content, siteConfig) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              unified().use(parse).use(stringify).use(wikiLinks).use(wikiImages).process(content, function (err, file) {
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

function processSourceEntry(_x4, _x5) {
  return _processSourceEntry.apply(this, arguments);
}

function _processSourceEntry() {
  _processSourceEntry = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(entry, siteConfig) {
    var src, dest, frontMatter, content, processed, serializedFrontMatter, fullContent;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            src = entry.src, dest = entry.dest, frontMatter = entry.frontMatter;
            _context3.next = 3;
            return readFile(src, {
              encoding: 'utf-8'
            });

          case 3:
            content = _context3.sent;
            _context3.next = 6;
            return processMarkdownContent(content, siteConfig);

          case 6:
            processed = _context3.sent;
            serializedFrontMatter = "";

            if (frontMatter) {
              serializedFrontMatter = '---\n' + yaml.safeDump(frontMatter) + '---\n';
            }

            fullContent = serializedFrontMatter + '\n' + processed;
            _context3.next = 12;
            return ensureDirectoryExists(dest);

          case 12:
            return _context3.abrupt("return", writeFile(dest, fullContent, {
              encoding: 'utf-8'
            }));

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _processSourceEntry.apply(this, arguments);
}

function copyUnknown(_x6, _x7) {
  return _copyUnknown.apply(this, arguments);
}

function _copyUnknown() {
  _copyUnknown = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(filePath, siteConfig) {
    var relative, dest;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (siteConfig.copyUnknownInputFiles) {
              _context4.next = 3;
              break;
            }

            console.log('not copying unknown file ', filePath);
            return _context4.abrupt("return");

          case 3:
            relative = path.relative(siteConfig.inputPath, filePath);
            dest = path.join(siteConfig.outputPath, relative);
            _context4.next = 7;
            return ensureDirectoryExists(dest);

          case 7:
            console.log('copying ', filePath, ' to ', dest);
            return _context4.abrupt("return", copyFile(filePath, dest));

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _copyUnknown.apply(this, arguments);
}

function processSite(_x8) {
  return _processSite.apply(this, arguments);
}

function _processSite() {
  _processSite = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(siteConfig) {
    var files, promises, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, f, entry;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return readDir(siteConfig.inputPath);

          case 2:
            files = _context5.sent;
            promises = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context5.prev = 7;

            for (_iterator = files[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              f = _step.value;
              entry = siteConfig.sourceEntry(f);

              if (entry) {
                promises.push(processSourceEntry(entry, siteConfig));
              } else {
                promises.push(copyUnknown(f, siteConfig));
              }
            }

            _context5.next = 15;
            break;

          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context5.t0;

          case 15:
            _context5.prev = 15;
            _context5.prev = 16;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 18:
            _context5.prev = 18;

            if (!_didIteratorError) {
              _context5.next = 21;
              break;
            }

            throw _iteratorError;

          case 21:
            return _context5.finish(18);

          case 22:
            return _context5.finish(15);

          case 23:
            return _context5.abrupt("return", Promise.all(promises));

          case 24:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[7, 11, 15, 23], [16,, 18, 22]]);
  }));
  return _processSite.apply(this, arguments);
}

module.exports = {
  processSite: processSite
};