'use strict'
// @flow

const {Wit} = require('node-wit')
const {WIT_TOKEN} = require('../config')
const {fetchWeather} = require('./weather')

function mapObject (obj /* : Object */, f /* : Function */) {
  return Object
    .keys(obj)
    .map(k => [k, f(obj[k], k)])
    .reduce(
      (newObj /* : Object */, [k, v] /* : Array */) /* : Object */ => {
        newObj[k] = v
        return newObj
      },
      {}
    )
}

const nothing = () /* : Object */ => {}

function wrapActions (actions /* : Array */, cbFunc /* : Function */) /* : Object */ {
  return mapObject(
    actions,
    (f, k) /* : Function */ => function () {
      const args = [].slice.call(arguments)
      cbFunc({name: k, args})
      return f.apply(null, arguments)
    }
  )
}

function resetContext ({context} /* : Object */) /* : Object */ {
  delete context.forecast
  delete context.location
  return context
}

const actions /* : Object */ = {
  send (request /* : Object */, response /* : Object */) {
    console.log(`Oscar : ${response.text}`)
    return Promise.resolve()
  },
  fetchWeather,
  resetContext,
  'null': ({sessionId, context /* : Object */, text, entities} /* : Object */) => {
    return Promise.resolve()
  }
}

function weatherBot (accessToken /* : Object */, cbFunc /* : Function */) /* : Object */ {
  return new Wit({
    accessToken: WIT_TOKEN,
    actions: wrapActions(actions, cbFunc || nothing)
  })
}

const client /* : Object */ = new Wit({
  accessToken: WIT_TOKEN,
  actions: wrapActions(actions, nothing)
})

module.exports /* : Object */ = {
  weatherBot,
  client
}
