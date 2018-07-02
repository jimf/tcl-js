const Lexer = require('./lexer')

const isWhitespace = c => c === ' ' || c === '\t'
const isCommandDelimiter = c => c === ';' || c === '\n'
const isWordSeparator = c => isWhitespace(c) || isCommandDelimiter(c)
const isSubs = c => c === '$' || c === '\\' || c === '['
const isBrace = c => c === '{' || c === '}'
const isBareWord = c => (c >= 'A' && c <= 'Z') || (c >= 'a' || c <= 'z') || (c >= '0' && c <= '9') || c === '_'
const isOctal = c => c >= '0' && c <= '7'
const isHex = c => (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')
// const isNormal = c => !isWhitespace(c) && !isCommandDelimiter(c) && !isSubs(c) && c !== '"' && c !== ')' && c !== ']' && !isBrace(c)

/**
 * Consume white-space and return resulting position.
 *
 * @param {string} input Tcl source
 * @param {number} start Index of input to start at
 * @param {boolean} includeNewlines Whether to consider newlines as white space
 * @return {array}
 */
function skipWhitespace (input, start, includeNewlines = false) {
  let pos = start
  let c = input.charAt(pos)
  while (pos < input.length && (isWhitespace(c) || (includeNewlines && c === '\n'))) {
    pos += 1
    c = input.charAt(c)
  }
  return pos
}

/**
 * Consume leading whitespace and comment and return resulting position.
 *
 * @param {string} input Tcl source
 * @param {number} start Index of input to start at
 * @return {array}
 */
function skipComment (input, start) {
  let pos = skipWhitespace(input, start, true)
  let c = input.charAt(pos)
  if (c === '#') {
    while (pos < input.length && c !== '\n') {
      pos += 1
      c = input.charAt(c)
    }
    if (c === '\n') { pos += 1 }
  }
  return pos
}

/**
 * Parse the first command of the given input.
 *
 * @param {string} input Tcl source
 * @param {int} start Index of input to start at
 * @param {boolean} isNested Whether command is within square brackets
 * @return {array}
 */
function parseCommand (input, start, isNested) {
  const node = { type: 'Command' }
  return node
}

function parseOctal (input, start) {
  let pos = start
  let c = input.charAt(pos)
  let result = ''
  while (pos < input.length && result.length <= 3 && isOctal(c)) {
    result += c
    pos += 1
    c = input.charAt(pos)
  }
  if (!result) { return null }
  return {
    type: 'Octal',
    value: String.fromCharCode(parseInt(result, 8)),
    start,
    end: start + result.length - 1
  }
}

function parseHex (input, start, max) {
  let pos = start
  let c = input.charAt(pos)
  let result = ''
  while (pos < input.length && result.length <= max && isHex(c)) {
    result += c
    pos += 1
    c = input.charAt(pos)
  }
  if (!result) { return null }
  return {
    type: 'Hex',
    value: String.fromCharCode(parseInt(result, 16)),
    start,
    end: start + result.length - 1
  }
}

function parseBackslash (input, start) {
  let c = input.charAt(start + 1) // Assume first char is backslash
  let result = c
  let end = start + 1
  switch (true) {
    case c === 'a': result = String.fromCharCode(7); break
    case c === 'b': result = '\b'; break
    case c === 'f': result = '\f'; break
    case c === 'n': result = '\n'; break
    case c === 'r': result = '\r'; break
    case c === 't': result = '\t'; break
    case c === 'v': result = '\v'; break
    case c === 'x': {
      const hex = parseHex(input, start + 2, 2)
      if (hex) {
        result = hex.value
        end = hex.end
      }
      break
    }
    case c === 'u': {
      const hex = parseHex(input, start + 2, 4)
      if (hex) {
        result = hex.value
        end = hex.end
      }
      break
    }
    case c === 'U': {
      const hex = parseHex(input, start + 2, 8)
      if (hex) {
        result = hex.value
        end = hex.end
      }
      break
    }
    case isOctal(c): {
      const octal = parseOctal(input, start + 1)
      if (octal) {
        result = octal.value
        end = octal.end
      }
      break
    }
    default: /* do nothing */
  }
  return {
    type: 'Backslash',
    value: result,
    start,
    end
  }
}

function parseQuotedString (input, start) {

}

function parseBraces (input, start) {
  let pos = start + 1
  let c = input.charAt(pos)
  let level = 1
  let result = ''
  let done = false

  while (pos < input.length && !done) {
    switch (c) {
      case '{':
        level += 1
        result += c
        break

      case '}':
        level -= 1
        if (level === 0) {
          done = true
        } else {
          result += c
        }
        break

      case '\\': {
        const bs = parseBackslash(input, pos)
        result += bs.value === '\n' ? ' ' : bs.value
        pos = bs.end
        break
      }

      default: result += c
    }

    pos += 1
    c = input.charAt(pos)
  }

  if (level !== 0) {
    // TODO: fix error message
    throw new Error('unmatched closing }')
  }

  return {
    type: 'Text',
    value: result,
    start,
    end: pos - 1
  }
}

function parseWords (input, start) {
  let pos = start
  let c = input.charAt(pos)
  let subVars = c !== '{'
  const tokens = []

  while (pos < input.length) {

  }
}

// /**
//  * Parse a script into a list of [raw] commands.
//  */
// function parseScript (input) {
//   const node = {
//     type: 'Script',
//     commands: []
//   }
//   let pos = 0
//   let c = input.charAt(pos)
//   let result = ''
//   let quoted = false
//   let braceQuoted = 0

//   function read () {
//     const val = c
//     pos += 1
//     c = input.charAt(pos)
//     return val
//   }

//   function pushCommand () {
//     node.commands.push({
//       type: 'Command',
//       value: result
//     })
//     result = ''
//   }

//   while (pos < input.length) {
//     switch (c) {
//       case ';':
//       case '\n':
//         if (!quoted && !braceQuoted && result.length) {
//           pushCommand()
//           read()
//         } else if (quoted || braceQuoted) {
//           result += read()
//         }
//         break

//       case '"':
//         if (!braceQuoted) {
//           quoted = !quoted
//         }
//         result += read()
//         break

//       case '{':
//         if (!quoted) {
//           braceQuoted += 1
//         }
//         result += read()
//         break

//       case '}':
//         if (!quoted) {
//           braceQuoted -= 1
//         }
//         result += read()
//         break

//       case '\\': {
//         result += read()
//         if (c !== undefined) {
//           result += read()
//         }
//         break
//       }

//       default:
//         result += read()
//         break
//     }
//   }

//   // TODO: handle unmatched quotes?

//   if (result.length) {
//     pushCommand()
//   }

//   return node
// }

// function parseWords (input) {
//   const node = {
//     type: 'WordList',
//     words: []
//   }
//   let pos = 0
//   let c = input.charAt(pos)
//   let result = ''
//   let quoted = false
//   let braceQuoted = 0

//   function read () {
//     const val = c
//     pos += 1
//     c = input.charAt(pos)
//     return val
//   }

//   function pushWord () {
//     node.words.push({
//       type: 'Word',
//       value: result
//     })
//     result = ''
//   }

//   while (pos < input.length) {
//     switch (c) {
//       case ' ':
//       case '\t':
//         if (!quoted && !braceQuoted && result.length) {
//           pushWord()
//           read()
//         } else if (quoted || braceQuoted) {
//           result += read()
//         }
//         break

//       case '"':
//         if (!braceQuoted) {
//           quoted = !quoted
//         }
//         result += read()
//         break

//       case '{':
//         if (!quoted) {
//           braceQuoted += 1
//         }
//         result += read()
//         break

//       case '}':
//         if (!quoted) {
//           braceQuoted -= 1
//         }
//         result += read()
//         break

//       case '\\': {
//         result += read()
//         if (c !== undefined) {
//           result += read()
//         }
//         break
//       }

//       default:
//         result += read()
//         break
//     }
//   }

//   // TODO: handle unmatched quotes?

//   if (result.length) {
//     pushWord()
//   }

//   return node
// }

// function parseWord (input) {
//   let pos = 0
//   let c = input.charAt(pos)
//   let result = ''

//   function read () {
//     const val = c
//     pos += 1
//     c = input.charAt(pos)
//     return val
//   }

//   function parseSimpleWord () {

//   }

//   function parseQuotedWord () {

//   }

//   function parseEnclosedWord () {

//   }

//   switch (c) {
//     case '"': return parseQuotedWord()
//     case '{': return parseEnclosedWord()
//     default: return parseSimpleWord()
//   }
// }

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

// module.exports.parseScript = parseScript
// module.exports.parseWords = parseWords
// module.exports.parseWord = parseWord
module.exports.parseBackslash = parseBackslash
module.exports.parseOctal = parseOctal
module.exports.parseHex = parseHex
module.exports.parseBraces = parseBraces
