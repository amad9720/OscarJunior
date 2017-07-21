// @flow

const fetch = require('isomorphic-fetch')
const {APPID} = require('../config')

const checkEntityValue /* : Function */ = (entities /* : Object */, entity /* : String */) /* : ?String */ => {
  const val /* : ?any */ = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value

  if (!val) {
    return null
  }
  return typeof val === 'object' ? val.value : val
}

function forecastFor (weatherApiRes /* : Object */, location /* : string */, dateTime /* : string */) {
  var forecast = ''
  if (weatherApiRes.error) {
    return weatherApiRes.error.message
  }
  if (dateTime) {
    for (let i = weatherApiRes.forecast.forecastday.length - 1; i >= 0; i--) {
      if (weatherApiRes.forecast.forecastday[i].date === dateTime) {
        const dayForecast = weatherApiRes.forecast.forecastday[i]
        forecast = `${dayForecast.day.avgtemp_c} °C  , ${dayForecast.day.condition.text} in ${locationFor(weatherApiRes)} to this date ${String(dateTime)}`
        break
      }
    }
  } else forecast = `${weatherApiRes.current.temp_c} °C , ${weatherApiRes.current.condition.text} in ${locationFor(weatherApiRes)}`

  if (forecast === '') {
    forecast = 'not available for given date.'
  }
  return forecast
}

const withForecast = (contxt /* : Object */, forecast /* : string */) => {
  contxt.forecast = forecast
  return contxt
}

function locationFor (weatherApiRes /* : Object */) {
  if (weatherApiRes.error) {
    return ''
  }
  return weatherApiRes.location.name
}

const withLocation /* : Function */ = (contxt /* : Object */, loc /* : String */) /* : Object */ => {
  contxt.location = loc
  delete contxt.missingLocation
  return contxt
}

const noLocation /* : Function */ = (contxt /* : Object */) /* : Object */ => {
  contxt.missingLocation = true
  delete contxt.forecast
  return contxt
}

const withAPIError /* : Function */ = (contxt /* : Object */, err /* : Object */) /* : Object */ => {
  contxt.forecast = `Weather data not available error ${err.toString()}`
  return contxt
}

function fetchWeather ({context, entities} /* : Object */) /* : Promise<*> */ {
  const location /* : ?string */ = checkEntityValue(entities, 'location')
  if (!location) return Promise.resolve(noLocation(context))

  let dateTime /* : any */ = checkEntityValue(entities, 'datetime')

  dateTime = dateTime ? dateTime.substring(0, 10) : null
  const isDatePresent /* : any */ = dateTime

  return getWeatherFromAPI(location, isDatePresent).then(
      res => {
        return withLocation(
          withForecast(context, forecastFor(res, location, dateTime)),
          locationFor(res)
        )
      },
      err => withAPIError(withLocation(context, location), err)
    )
}

function getWeatherFromAPI (location /* : string */, isDatePresent /* : any */) {
  const days /* : any */ = isDatePresent ? 10 : 0

  return fetch(
    `http://api.apixu.com/v1/forecast.json?key=${APPID}&q=${location}&days=${days}`
  ).then(res => res.json())
}

module.exports = {
  fetchWeather,
  checkEntityValue,
  forecastFor,
  withForecast,
  locationFor,
  withLocation,
  noLocation,
  withAPIError,
  getWeatherFromAPI
}
