const Value = require('./value')

function Scope (parent) {
  this.parent = parent || null
  this.members = {}
}

Scope.prototype.pop = function pop () {
  return this.parent
}

Scope.prototype.define = function define (name, value) {
  this.members[name] = new Value(name, value)
  return this
}

Scope.prototype.resolve = function resolve (name) {
  if (Object.prototype.hasOwnProperty.call(this.members, name)) {
    return this.members[name]
  } else if (this.parent !== null) {
    return this.parent.resolve(name)
  }
  throw new Error(`can't read "${name}": no such variable`)
}

module.exports = Scope
