const CommandSet = require('./commands')
const IO = require('./io')
const parse = require('./parser')
const Scope = require('./scope')

// function substitute (intr, word) {

// }

function Interpreter () {
  this.currentScope = new Scope()
  this.io = new IO()
  this.commands = new CommandSet(this)
  this.lastResult = null
}

Interpreter.prototype.run = function run (input) {
  const ast = parse(input)
  ast.statements.forEach((statement) => {
    const [cmd, ...args] = statement.words.map((w) => {
      let { value } = w
      if (w.hasVariable) {
        value = value.replace(/\$\S+/g, (m) => {
          return this.currentScope.resolve(m.slice(1)).value
        })
      }
      return value
    })
    this.lastResult = this.commands.invoke(cmd, args) || ''
  })
  return this.lastResult
}

module.exports = Interpreter
