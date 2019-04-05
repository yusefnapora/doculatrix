"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Joi = require('joi');

var yaml = require('js-yaml');

var fs = require('fs');

var path = require('path');

var _require = require('util'),
    promisify = _require.promisify;

var readFile = promisify(fs.readFile);
var sourceSchema = Joi.object().keys({
  src: Joi.string().description("Path to input file, relative to root inputPath").required(),
  dest: Joi.string().description("Path to output file, relative to root outputPath. Defaults to `src`."),
  frontMatter: Joi.object().description("An object to use as hugo front-matter.")
});
var configSchema = Joi.object().keys({
  inputPath: Joi.string().description("Path to directory containing input docs. All `src` entries in `sources` are relative to this dir.").required(),
  outputPath: Joi.string().description("Path to directory to use for output. Will be created if it does not exist. All `dest` entries in `sources` are relative to this dir.").required(),
  copyUnknownInputFiles: Joi.boolean().description("If true, files that are not present in `sources` will be copied unchanged to the output directory.").default(true),
  sources: Joi.array().description("A collection of `source` objects containing paths to docs and metadata about them.").items(sourceSchema).default(function () {
    return [];
  }, "empty array")
}).required();

function validate(config) {
  var _Joi$validate = Joi.validate(config, configSchema),
      error = _Joi$validate.error,
      value = _Joi$validate.value;

  if (error) {
    throw error;
  }

  return value;
}

var fileExists = function fileExists(filePath) {
  return new Promise(function (resolve, reject) {
    if (!filePath) {
      return resolve(false);
    }

    fs.access(filePath, fs.F_OK, function (err) {
      if (!err) {
        return resolve(true);
      }

      if (err.code === 'ENOENT') {
        return resolve(false);
      }

      reject(err);
    });
  });
};

var SiteConfig =
/*#__PURE__*/
function () {
  function SiteConfig() {
    _classCallCheck(this, SiteConfig);

    for (var _len = arguments.length, configObjects = new Array(_len), _key = 0; _key < _len; _key++) {
      configObjects[_key] = arguments[_key];
    }

    var merged = Object.assign.apply(Object, [{}].concat(configObjects));
    this._config = validate(merged);
  }

  _createClass(SiteConfig, [{
    key: "_rewritePaths",
    value: function _rewritePaths(sourceEntry) {
      var src = path.join(this.inputPath, sourceEntry.src);
      var dest = path.join(this.outputPath, sourceEntry.dest || sourceEntry.src);
      return _objectSpread({}, sourceEntry, {
        src: src,
        dest: dest
      });
    }
  }, {
    key: "sourceEntry",
    value: function sourceEntry(fullInputPath) {
      return this.sourcesMap.get(fullInputPath);
    }
  }, {
    key: "inputPath",
    get: function get() {
      return this._config.inputPath;
    }
  }, {
    key: "outputPath",
    get: function get() {
      return this._config.outputPath;
    }
  }, {
    key: "copyUnknownInputFiles",
    get: function get() {
      return this._config.copyUnknownInputFiles;
    }
  }, {
    key: "sources",
    get: function get() {
      var _this = this;

      var entries = this._config.sources || [];
      return entries.map(function (e) {
        return _this._rewritePaths(e);
      });
    }
  }, {
    key: "sourcesMap",
    get: function get() {
      return new Map(this.sources.map(function (s) {
        return [s.src, s];
      }));
    }
  }, {
    key: "wikiLinkMap",
    get: function get() {
      return new Map(this._config.sources.map(function (s) {
        return [path.basename(s.src, '.md'), s];
      }));
    }
  }], [{
    key: "fromCommandLineArgs",
    value: function () {
      var _fromCommandLineArgs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(argv) {
        var inputPath, outputPath, commandLineArgs, configFileExists, ext;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                inputPath = argv.inputPath, outputPath = argv.outputPath;
                commandLineArgs = {
                  inputPath: inputPath,
                  outputPath: outputPath
                };
                _context.next = 4;
                return fileExists(argv.config);

              case 4:
                configFileExists = _context.sent;

                if (!configFileExists) {
                  _context.next = 11;
                  break;
                }

                ext = path.extname(argv.config).toLowerCase();

                if (!(ext === '.json')) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt("return", SiteConfig.fromJsonFile(argv.config, commandLineArgs));

              case 9:
                if (!(ext === '.yaml' || ext == '.yml')) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", SiteConfig.fromYamlFile(argv.config, commandLineArgs));

              case 11:
                return _context.abrupt("return", new SiteConfig(commandLineArgs));

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fromCommandLineArgs(_x) {
        return _fromCommandLineArgs.apply(this, arguments);
      }

      return fromCommandLineArgs;
    }()
  }, {
    key: "fromJsonFile",
    value: function () {
      var _fromJsonFile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(filePath, commandLineOptions) {
        var content;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return readFile(filePath, {
                  encoding: 'utf-8'
                });

              case 2:
                content = _context2.sent;
                return _context2.abrupt("return", new SiteConfig(JSON.parse(content), commandLineOptions));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function fromJsonFile(_x2, _x3) {
        return _fromJsonFile.apply(this, arguments);
      }

      return fromJsonFile;
    }()
  }, {
    key: "fromYamlFile",
    value: function () {
      var _fromYamlFile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(filePath, commandLineOptions) {
        var content;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return readFile(filePath, {
                  encoding: 'utf-8'
                });

              case 2:
                content = _context3.sent;
                return _context3.abrupt("return", new SiteConfig(yaml.safeLoad(content), commandLineOptions));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function fromYamlFile(_x4, _x5) {
        return _fromYamlFile.apply(this, arguments);
      }

      return fromYamlFile;
    }()
  }]);

  return SiteConfig;
}();

module.exports = {
  SiteConfig: SiteConfig
};