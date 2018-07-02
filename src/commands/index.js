const puts = require('./puts')
const set = require('./set')

function CommandSet (ctx) {
  this.ctx = ctx
  this.commands = {
    puts,
    set
  }
}

CommandSet.prototype.define = function define (name, fn) {
  this.commands[name] = fn
  return this
}

CommandSet.prototype.invoke = function invoke (cmd, args) {
  if (!Object.prototype.hasOwnProperty.call(this.commands, cmd)) {
    throw new Error(`invalid command name ${cmd}`)
  }
  return this.commands[cmd](this.ctx, args)
}

module.exports = CommandSet
