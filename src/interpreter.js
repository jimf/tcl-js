const CommandSet = require('./commands')
const IO = require('./io')
const parse = require('./parser')
const Scope = require('./scope')

function Interpreter () {
  this.currentScope = new Scope()
  this.io = new IO()
  this.commands = new CommandSet(this)
  this.lastResult = null
}

Interpreter.prototype.run = function run (input) {
  const ast = parse(input)
  ast.statements.forEach((statement) => {
    const [cmd, ...args] = statement.words.map(w => w.value)
    this.lastResult = this.commands.invoke(cmd, args) || ''
  })
  return this.lastResult
}

module.exports = Interpreter
