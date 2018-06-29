function InputOutput () {}

InputOutput.prototype.write = function write (channelId, string) {
  switch (channelId) {
    case 'stdout': process.stdout.write(string); break
    default: throw new Error(`can not find channel named "${channelId}"`)
  }
}

module.exports = InputOutput
