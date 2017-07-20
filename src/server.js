'use strict'

const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const express = require('express')

const {WIT_TOKEN, SERVER_PORT} = require('./config')
const {weatherBot, client} = require('./utils/utils')

let interactive = null
const _store = {}

function getContext (sessionId) {
  return _store[sessionId] || {}
}

function setContext (sessionId, ctx) {
  _store[sessionId] = ctx
}

interactive = require('node-wit').interactive

const app = express()
// Usage of middleware for Express app routers
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Some header Configs
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Authorization', `Bearer ${WIT_TOKEN}`)
  next()
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// App routers
app.get('/chat', (req, res) => {
  const actions = []
  const cb = (action) => actions.push(action)
  const {text, sessionId} = req.query
  const engine = weatherBot(WIT_TOKEN, cb)
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
