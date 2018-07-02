/**
 * set - reads and writes variables
 *
 * :: varName ?value?
 *
 * @see https://wiki.tcl.tk/1024
 */
module.exports = function (ctx, args) {
  const [varName, value] = args

  // TODO: handle arrays

  if (args.length === 2) {
    ctx.currentScope.define(varName, value)
    return value
  } else if (args.length === 1) {
    const symbol = ctx.currentScope.resolve(varName)
    return symbol.value
  }

  throw new Error('wrong # args: should be "set varName ?newValue?"')
}
