const fetch = require('isomorphic-fetch')
const {APPID} = require('../config')

const checkEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value

  if (!val) {
    return null
  }
  return typeof val === 'object' ? val.value : val
}

function forecastFor (weatherApiRes, location, dateTime) {
  var forecast = ''
  if (weatherApiRes.error) {
    return weatherApiRes.error.message
  }
  if (dateTime) {
    for (let i = weatherApiRes.forecast.forecastday.length - 1; i >= 0; i--) {
      if (weatherApiRes.forecast.forecastday[i].date === dateTime) {
        const dayForecast = weatherApiRes.forecast.forecastday[i]
        forecast = dayForecast.day.avgtemp_c + '°C' + ', ' + dayForecast.day.condition.text + ' in ' + locationFor(weatherApiRes)
        break
      }
    }
  } else forecast = weatherApiRes.current.temp_c + '°C' + ', ' + weatherApiRes.current.condition.text + ' in ' + locationFor(weatherApiRes)

  if (forecast === '') {
    forecast = 'not available for given date.'
  }
  return forecast
}

const withForecast = (contxt, forecast) => {
  contxt.forecast = forecast
  return contxt
}

function locationFor (weatherApiRes) {
  if (weatherApiRes.error) {
    return ''
  }
  return weatherApiRes.location.name
}

const withLocation = (contxt, loc) => {
  contxt.location = loc
  delete contxt.missingLocation
  return contxt
}

const noLocation = (contxt) => {
  contxt.missingLocation = true
  delete contxt.forecast
  return contxt
}

const withAPIError = (contxt, err) => {
  contxt.forecast = 'Weather data not available'
  return contxt
}

function fetchWeather ({context, entities}) {
  // console.log(entities)
  const location = checkEntityValue(entities, 'location')
  if (!location) return Promise.resolve(noLocation(context))

  let dateTime = checkEntityValue(entities, 'datetime')

  dateTime = dateTime ? dateTime.substring(0, 10) : null
  const isDatePresent = dateTime ? true : false

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

function getWeatherFromAPI (location, isDatePresent) {
  const days = isDatePresent ? 10 : 0

  return fetch(
    'http://api.apixu.com/v1/forecast.json?' + `key=${APPID}&q=${location}&days=${days}`
  ).then(res => res.json())
}

module.exports = {
  fetchWeather
}
