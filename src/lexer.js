function WordToken (attrs) {
  this.type = 'Word'
  Object.assign(this, attrs)
}

module.exports = function (input) {
  let pos = 0
  let c = input.charAt(0)
  let wordIdx = 0

  function read () {
    const val = c
    pos += 1
    c = input.charAt(pos)
    return val
  }

  const isWhitespace = ch => ch === ' ' || ch === '\t'
  const isCommandDelimiter = ch => ch === ';' || ch === '\n'
  const isWordSeparator = ch => isWhitespace(ch) || isCommandDelimiter(ch)

  function skipWhitespace () {
    while (isWhitespace(c)) { read() }
  }

  function skipComment () {
    while (pos < input.length && c !== '\n') { read() }
  }

  function scanWord (delimiter) {
    let value = ''
    let hasVariable = false
    let hasSubExpr = false
    const index = wordIdx
    const testEndOfWord = delimiter ? ch => ch === delimiter : isWordSeparator

    while (pos < input.length && !testEndOfWord(c)) {
      hasVariable = delimiter !== '}' && (hasVariable || c === '$')
      hasSubExpr = delimiter !== '}' && (hasSubExpr || c === '[')
      value += read()
    }

    if (delimiter) {
      if (!testEndOfWord(c)) {
        throw new Error('Parse error: unexpected end of input')
      }
      read()
    }

    wordIdx += 1
    return new WordToken({ value, index, hasVariable, hasSubExpr })
  }

  function skipEndOfCommand () {
    while (isCommandDelimiter(c) || isWhitespace(c)) { read() }
    wordIdx = 0
  }

  function nextToken () {
    skipWhitespace()
    if (pos >= input.length) { return null }
    switch (true) {
      case wordIdx === 0 && c === '#': skipComment(); return nextToken()
      case isCommandDelimiter(c): skipEndOfCommand(); return nextToken()
      case c === '"': read(); return scanWord('"')
      case c === '{': read(); return scanWord('}')
      default: return scanWord()
    }
  }

  // function tokenize () {
  //   const tokens = []
  //   let token = nextToken()
  //   while (token !== null) {
  //     tokens.push(token)
  //     token = nextToken()
  //   }
  //   return tokens
  // }

  // return tokenize()

  return { nextToken }
}
