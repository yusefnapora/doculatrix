"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contentMapFromWikiFiles = contentMapFromWikiFiles;

var _path = _interopRequireDefault(require("path"));

var _contentMap = require("../content-map");

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wikiTarget(filePath) {
  if (!filePath.endsWith('.md')) {
    return null;
  }

  return _path.default.basename(filePath);
}

function fileDestination(filePath) {
  if (!filePath.endsWith('.md')) {
    return filePath;
  }

  var section = _path.default.basename(filePath).toLowerCase();

  return _path.default.join(section, '_index.md');
}

var entryForWikiFile = function entryForWikiFile(filePath) {
  return {
    src: filePath,
    dest: fileDestination(filePath)
  };
};

function contentMapFromWikiFiles(filePaths) {}