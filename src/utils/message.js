const moment = require('moment')

var messageGen = function (from, content) {
  return {
    from,
    content,
    createdAt: moment().valueOf()
  }
}

module.exports = {
  messageGen
}
