"use strict";

var _siteConfig = require("../site-config");

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
  regeneratorRuntime.mark(function _callee2(content, contentMap) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              unified().use(parse).use(stringify).use(wikiLinks, {
                contentMap: contentMap
              }).use(wikiImages).process(content, function (err, file) {
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

function processMarkdownEntry(_x4, _x5) {
  return _processMarkdownEntry.apply(this, arguments);
}

function _processMarkdownEntry() {
  _processMarkdownEntry = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(entry, siteConfig) {
    var content, processed, fullContent, dest;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return readFile(siteConfig.fullInputFilePath(entry.src), {
              encoding: 'utf-8'
            });

          case 2:
            content = _context3.sent;
            _context3.next = 5;
            return processMarkdownContent(content, siteConfig.contentMap);

          case 5:
            processed = _context3.sent;
            fullContent = '';

            if (entry.hugoFrontMatter) {
              fullContent = yaml.safeDump(entry.hugoFrontMatter) + '\n';
            }

            fullContent += processed;
            dest = siteConfig.fullOutputFilePathForInputFile(entry.src);
            console.info('writing processed input file ' + entry.src + ' to ' + dest);
            _context3.next = 13;
            return writeFile(dest, fullContent);

          case 13:
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
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", copyFile(siteConfig.fullInputFilePath(entry.src), siteConfig.fullOutputFilePathForInputFile(entry.src)));

          case 1:
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
            promises = [ensureDirectoryExists(siteConfig.outputPath)];
            siteConfig.contentMap.entries.forEach(function (entry) {
              if (isMarkdown(entry)) {
                promises.push(processMarkdownEntry(entry, siteConfig));
              } else {
                promises.push(copyEntry(entry, siteConfig));
              }
            });
            return _context5.abrupt("return", Promise.all(promises));

          case 3:
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