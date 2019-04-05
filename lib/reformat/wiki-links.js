"use strict";

var _require = require('url'),
    URL = _require.URL;

var isRelativeUrl = require('is-relative-url');

var visit = require('unist-util-visit');

var definitions = require('mdast-util-definitions');

var hugoRef = function hugoRef(original) {
  return "{{% ref \"".concat(original, "\" %}}");
};

var WIKI_ENTRY_REGEX = /^[A-Z]+.*(?!\..*)$/;

function rewriteWikiLinkTarget(url) {
  if (!url.match(WIKI_ENTRY_REGEX)) {
    return hugoRef(url);
  }

  var u = new URL(url, 'file://');
  var dir = u.pathname.toLowerCase();
  var target = "".concat(dir, "/_index.md") + u.search + u.hash;
  return hugoRef(target);
}

function wikiLinkPlugin() {
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

      if (ctx.url.startsWith('#')) {
        return;
      }

      ctx.url = rewriteWikiLinkTarget(ctx.url);
    };

    visit(tree, ['link', 'linkReference'], visitor);
  };
}

module.exports = wikiLinkPlugin;