const Lexer = require('./lexer')

module.exports = function (input) {
  const lexer = Lexer(input)
  let token = lexer.nextToken()

  function nextToken () {
    const val = token
    token = lexer.nextToken()
    return val
  }

  function nextStatement () {
    if (token === null) { return null }
    const node = {
      type: 'Statement',
      words: [nextToken()]
    }
    while (token !== null && token.index !== 0) {
      node.words.push(nextToken())
    }
    return node
  }

  function program () {
    const node = {
      type: 'Program',
      statements: []
    }
    let stmt = nextStatement()
    while (stmt) {
      node.statements.push(stmt)
      stmt = nextStatement()
    }
    return node
  }

  return program()
}
