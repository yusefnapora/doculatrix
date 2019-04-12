"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = wikiLinkPlugin;
exports.hugoRef = void 0;

var _contentMap = require("../content-map");

var isRelativeUrl = require('is-relative-url');

var visit = require('unist-util-visit');

var definitions = require('mdast-util-definitions');

var hugoRef = function hugoRef(original) {
  var hash = urlHash(original);
  var base = "{{% ref \"".concat(urlBase(original), "\" %}}");

  if (hash) {
    return base + '#' + hash;
  }

  return base;
};

exports.hugoRef = hugoRef;

var urlBase = function urlBase(url) {
  return url.split('#')[0];
};

var urlHash = function urlHash(url) {
  var components = url.split('#', 2);
  return components.length > 1 ? components[1] : null;
};

function rewriteWikiLinkTarget(url, contentMap) {
  var entry = contentMap.wikiTargetMap.get(urlBase(url));

  if (!entry) {
    return hugoRef(url);
  }

  var dest = hugoRef(contentMap.getOutputPath(entry.src));
  var hash = urlHash(url);

  if (hash) {
    return dest + '#' + hash;
  }

  return dest;
}

function wikiLinkPlugin(opts) {
  var contentMap = opts.contentMap;
  return function (tree) {
    var definition = definitions(tree);

    var visitor = function visitor(node) {
      var ctx = node.type === 'link' ? node : definition(node.identifier);

      if (!ctx) {
        return;
      } // skip absolute references


      if (!isRelativeUrl(ctx.url)) {
        return;
      } // skip local anchor links


      if (ctx.url.startsWith('#')) {
        return;
      }

      ctx.url = rewriteWikiLinkTarget(ctx.url, contentMap);
    };

    visit(tree, ['link', 'linkReference'], visitor);
  };
}