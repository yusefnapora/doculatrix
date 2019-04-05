"use strict";

var getFrontmatter = function getFrontmatter(astNode) {
  if (!astNode || astNode.type !== 'html') {
    return astNode;
  }

  var prefix = '<!---';
  var suffix = '--->';
  var value = astNode.value;

  if (!value || !value.startsWith(prefix) || !astNode.value.endsWith(suffix)) {
    return astNode;
  }

  var start = prefix.length;
  var end = value.length - suffix.length;
  var content = value.substring(start, end).trim();
  return {
    type: 'yaml',
    value: content,
    position: astNode.position
  };
};

var frontmatterComments = function frontmatterComments() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (tree, file) {
    tree.children[0] = getFrontmatter(tree.children[0]);
  };
};

module.exports = frontmatterComments;