"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contentMapFromWiki = contentMapFromWiki;

var _contentMap = require("../content-map");

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function contentMapFromWiki(_x) {
  return _contentMapFromWiki.apply(this, arguments);
}

function _contentMapFromWiki() {
  _contentMapFromWiki = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(localWikiDirectory) {
    var files;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _recursiveReaddir.default)(localWikiDirectory);

          case 2:
            files = _context.sent;
            console.log(JSON.stringify(files, null, null, 2));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _contentMapFromWiki.apply(this, arguments);
}