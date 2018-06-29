function Scope (parent) {
  this.parent = parent || null
  this.members = new Set([])
}

Scope.prototype.pop = function pop () {
  return this.parent
}

Scope.prototype.define = function define (name) {
  this.members.add(name)
  return this
}

module.exports = Scope
