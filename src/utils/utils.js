'use strict'

const {Wit} = require('node-wit')
const {WIT_TOKEN} = require('../config')
const {fetchWeather} = require('./weather')

function mapObject (obj, f) {
  return Object
    .keys(obj)
    .map(k => [k, f(obj[k], k)])
    .reduce(
      (newObj, [k, v]) => {
        newObj[k] = v
        return newObj
      },
      {}
    )
}

const nothing = () => {}

function wrapActions (actions, cbFunc) {
  return mapObject(
    actions,
    (f, k) => function () {
      const args = [].slice.call(arguments)
      cbFunc({name: k, args})
      return f.apply(null, arguments)
    }
  )
}

function resetContext ({context}) {
  delete context.forecast
  delete context.location
  return context
}

const actions = {
  send (request, response) {
    console.log('sending...', JSON.stringify(response))
    return Promise.resolve()
  },
  fetchWeather,
  resetContext,
  'null': ({sessionId, context, text, entities}) => {
    return Promise.resolve()
  }
}

function weatherBot (accessToken, cbFunc) {
  return new Wit({
    accessToken: WIT_TOKEN,
    actions: wrapActions(actions, cbFunc || nothing)
  })
}

const client = new Wit({
  accessToken: WIT_TOKEN,
  actions: wrapActions(actions, nothing)
})

module.exports = {
  weatherBot,
  client
}
