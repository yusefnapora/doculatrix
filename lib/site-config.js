"use strict";

var _contentMap = require("./content-map");

var _util = require("./util");

var _wikiConfig = _interopRequireDefault(require("./wiki/wiki-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
var SiteConfigSchema = Joi.object().keys({
  inputPath: Joi.string().description("Path to directory containing input docs. All `src` entries in `sources` are relative to this dir.").required(),
  outputPath: Joi.string().description("Path to directory to use for output. Will be created if it does not exist. All `dest` entries in `sources` are relative to this dir.").required(),
  wiki: Joi.object().keys({
    deriveContentMap: Joi.boolean().default(true),
    metadata: Joi.object()
  }),
  contentMap: Joi.array().description("Describes how to map input files to output files").items(_contentMap.ContentMapEntrySchema)
}).required();

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
  function SiteConfig(options) {
    _classCallCheck(this, SiteConfig);

    this._config = (0, _util.validate)(options, SiteConfigSchema);
    this.contentMap = new _contentMap.ContentMap(this._config.contentMap);
  }

  _createClass(SiteConfig, [{
    key: "fullInputFilePath",
    value: function fullInputFilePath(relativeInputFilePath) {
      return path.join(this.inputPath, relativeInputFilePath);
    }
  }, {
    key: "fullOutputFilePathForInputFile",
    value: function fullOutputFilePathForInputFile(relativeInputFilePath) {
      return this.contentMap.getOutputPath(relativeInputFilePath, this.outputPath);
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
    key: "isWiki",
    get: function get() {
      return !!this._config.wiki;
    }
  }], [{
    key: "buildConfig",
    value: function () {
      var _buildConfig = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _len,
            configObjects,
            _key,
            merged,
            options,
            wikiConfig,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                for (_len = _args.length, configObjects = new Array(_len), _key = 0; _key < _len; _key++) {
                  configObjects[_key] = _args[_key];
                }

                merged = Object.assign.apply(Object, [{}].concat(configObjects));
                options = (0, _util.validate)(merged, SiteConfigSchema);

                if (options.wiki.deriveContentMap) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", new SiteConfig(options));

              case 5:
                _context.next = 7;
                return _wikiConfig.default.fromWikiDirectory(options.inputPath, options.wiki);

              case 7:
                wikiConfig = _context.sent;
                return _context.abrupt("return", new SiteConfig(_objectSpread({}, options, {
                  contentMap: wikiConfig.contentMap,
                  wikiConfig: wikiConfig
                })));

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function buildConfig() {
        return _buildConfig.apply(this, arguments);
      }

      return buildConfig;
    }()
  }, {
    key: "fromCommandLineArgs",
    value: function () {
      var _fromCommandLineArgs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(argv) {
        var inputPath, outputPath, commandLineArgs, configFileExists, ext;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                inputPath = argv.inputPath, outputPath = argv.outputPath;
                commandLineArgs = {
                  inputPath: inputPath,
                  outputPath: outputPath
                };
                _context2.next = 4;
                return fileExists(argv.config);

              case 4:
                configFileExists = _context2.sent;

                if (!configFileExists) {
                  _context2.next = 11;
                  break;
                }

                ext = path.extname(argv.config).toLowerCase();

                if (!(ext === '.json')) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt("return", SiteConfig.fromJsonFile(argv.config, commandLineArgs));

              case 9:
                if (!(ext === '.yaml' || ext == '.yml')) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt("return", SiteConfig.fromYamlFile(argv.config, commandLineArgs));

              case 11:
                return _context2.abrupt("return", this.buildConfig(commandLineArgs));

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
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
                return _context3.abrupt("return", this.buildConfig(JSON.parse(content), commandLineOptions));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
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
      regeneratorRuntime.mark(function _callee4(filePath, commandLineOptions) {
        var content;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return readFile(filePath, {
                  encoding: 'utf-8'
                });

              case 2:
                content = _context4.sent;
                return _context4.abrupt("return", this.buildConfig(yaml.safeLoad(content), commandLineOptions));

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
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