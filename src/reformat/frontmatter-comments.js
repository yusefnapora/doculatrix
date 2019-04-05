

const getFrontmatter = (astNode) => {
  if (!astNode || astNode.type !== 'html') {
    return astNode
  }

  const prefix = '<!---'
  const suffix = '--->'
  const value = astNode.value
  if (!value
    || !value.startsWith(prefix)
    || !astNode.value.endsWith(suffix)) {
    return astNode
  }

  const start = prefix.length
  const end = value.length - suffix.length
  const content = value.substring(start, end).trim()

  return ({
    type: 'yaml',
    value: content,
    position: astNode.position
  })
}

const frontmatterComments = (options = {}) => (tree, file) => {
  tree.children[0] = getFrontmatter(tree.children[0])
}


module.exports = frontmatterComments;
