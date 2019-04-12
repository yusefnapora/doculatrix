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
  return "{{% ref \"".concat(original, "\" %}}");
};

exports.hugoRef = hugoRef;

function rewriteWikiLinkTarget(url, contentMap) {
  var entry = contentMap.wikiTargetMap.get(url);

  if (!entry) {
    return hugoRef(url);
  }

  var dest = contentMap.getOutputPath(entry.src);
  return hugoRef(dest);
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