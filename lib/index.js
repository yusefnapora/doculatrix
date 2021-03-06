"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('@babel/polyfill');

var _require = require('./reformat'),
    processSite = _require.processSite;

var _require2 = require('./site-config'),
    SiteConfig = _require2.SiteConfig;

var argv = require('yargs').describe('inputPath', 'path to local directory containing docs').alias('i', 'inputPath').describe('outputPath', 'path to local directory where you want to output formatted docs').alias('o', 'outputPath').default('outputPath', './content/').describe('config', 'path to config file for site metadata').alias('c', 'config').default('config', 'doculatrix.yaml').boolean('wiki', 'if set, treat the input path as a github wiki and derive as much config as possible').alias('w', 'wiki').default(false).demand(['inputPath']).argv;

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var config;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return SiteConfig.fromCommandLineArgs(argv);

          case 2:
            config = _context.sent;
            _context.next = 5;
            return processSite(config);

          case 5:
            console.log('all done');

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _main.apply(this, arguments);
}

main().catch(console.error);