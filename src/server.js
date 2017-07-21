'use strict'
// @flow

const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const express = require('express')

const {WIT_TOKEN, SERVER_PORT} = require('./config')
const {weatherBot, client} = require('./utils/utils')

const _store /* : Object */ = {}

function getContext (sessionId /* : String */) /* : Object */ {
  return _store[sessionId] || {}
}

function setContext (sessionId /* : String */, ctx /* : Object */) /* : null */ {
  _store[sessionId] = ctx
  return null
}

const {interactive} /* : Object */ = require('node-wit')

const app = express()
// Usage of middleware for Express app routers
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Some header Configs
app.use((req /* : Object */, res /* : Object */, next /* : Function */) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Authorization', `Bearer ${WIT_TOKEN}`)
  next()
})

// error handler
app.use((err /* : ?Error */, req /* : Object */, res /* : Object */, next /* : Function */) => {
  // set locals, only providing error in development
  if (err) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  }
})

// App routers
app.get('/chat', (req /* : Object */, res /* : Object */) => {
  const actions = []
  const cb /* : Function */ = (action /* : Object */) => actions.push(action)
  const {text, sessionId} /* : Object */ = req.query
  const engine /* : Object */ = weatherBot(WIT_TOKEN, cb)
  engine.runActions(
    sessionId,
    text,
    getContext(sessionId)
  ).then(
    context => {
      res.status(200).json({context, actions})

      setContext(sessionId, context)
    },
    err => {
      console.log('[engine] error', err)
      res.status(500).send('something went wrong :\\')
    }
  )
})

const server = app.listen(SERVER_PORT, () => {
  const port = server.address().port
  console.log(`App is running on port ${port}`)
})

interactive(client)
