"use strict";

var _require = require('url'),
    URL = _require.URL;

var path = require('path');

var isRelativeUrl = require('is-relative-url');

var visit = require('unist-util-visit');

var definitions = require('mdast-util-definitions');

var defaultExtensions = ['js', 'ts', 'go', 'rs', 'java', 'kt', 'cs'];

var hugofyLink = function hugofyLink(ctx) {
  var original = ctx.url;
  ctx.url = "{{% relref \"".concat(original, "\" %}}");
};

var absoluteLinkify = function absoluteLinkify() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var baseUrl = options.baseUrl;

  if (!baseUrl) {
    return new Error('Missing required option `baseUrl`');
  }

  var extensions = options.extensions || defaultExtensions;
  return function (tree) {
    var definition = definitions(tree);

    var visitor = function visitor(node) {
      var ctx = node.type === 'link' ? node : definition(node.identifier);

      if (!ctx) {
        return;
      }

      if (!isRelativeUrl(ctx.url)) {
        return;
      }

      var absolute = new URL(ctx.url, baseUrl);
      var extension = path.extname(absolute.pathname).split('.').pop().toLowerCase();

      if (extension === 'md') {
        hugofyLink(ctx);
        return;
      }

      if (extensions.indexOf(extension) == -1) {
        return;
      }

      ctx.url = absolute.toString();
    };

    visit(tree, ['link', 'linkReference'], visitor);
  };
};

module.exports = absoluteLinkify;