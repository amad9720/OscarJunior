// @flow

// All my test will be there
const expect = require('expect')
const {checkEntityValue, forecastFor, withForecast, locationFor, withLocation, noLocation, withAPIError, fetchWeather, getWeatherFromAPI} = require('./weather');

describe('Utils #Helper Functions', () => {
  let cntx = {}
  it('should return a String', function () {
    const entities = {
      datetime: [
        {
          confidence: 0.7296582047375707,
          values: [Object],
          value: '2017-07-21T08:17:17.000+02:00',
          grain: 'second',
          type: 'value'
        }
      ],
      location: [
        {
          confidence: 0.7466929077992122,
          type: 'value',
          value: 'Paris',
          suggested: true
        }
      ]
    }

    const res = checkEntityValue(entities, 'location')
    expect(res).toBeA('string')
  })

  it('should add forecast in cntx object', () => {
    cntx = withForecast(cntx, 'forecast here')
    expect(cntx).toInclude({forecast: 'forecast here'})
  })

  it('should add Location in cntx object', () => {
    cntx = withLocation(cntx, 'Paris')
    expect(cntx).toInclude({location: 'Paris'})
  })

  it('should remove location on cntx object', () => {
    cntx = noLocation(cntx)
    expect(cntx).toInclude({missingLocation: true})
    expect(cntx).toExclude({forecast: 'forecast here'})
  })

  it('should report forecast Error on cntx object', () => {
    const err = {
      value : 'Error status 500'
    }

    cntx = withAPIError(cntx, err)
    expect(cntx.forecast).toEqual(`Weather data not available error ${err.toString()}`)
  })

})

describe('Functions for forcast to API', () => {
  const entities = {
    datetime: [
      {
        confidence: 0.7296582047375707,
        values: [Object],
        value: '2017-07-21T08:17:17.000+02:00',
        grain: 'second',
        type: 'value'
      }
    ],
    location: [
      {
        confidence: 0.7466929077992122,
        type: 'value',
        value: 'Paris',
        suggested: true
      }
    ]
  }

  let context = {}

  it('should get a proper weather object from API', () => {
    return getWeatherFromAPI(checkEntityValue(entities, 'location'), '2017-07-21').then((res) => {
      expect(res).toIncludeKeys(['location', 'current', 'forecast'])
    })
  })

  it('should get a correct formated forcast from API', () => {
    const loc = checkEntityValue(entities, 'location')
    const date = checkEntityValue(entities, 'datetime').substring(0, 10)

    return getWeatherFromAPI(checkEntityValue(entities, 'location'), date).then((resAPI) => {
      const res = forecastFor(resAPI, loc, date)
      expect(res).toBeA('string')
    })

  })

  it('should get a correct location from API', () => {
    const loc = checkEntityValue(entities, 'location')
    const date = checkEntityValue(entities, 'datetime').substring(0, 10)

    return getWeatherFromAPI(loc, date).then((resAPI) => {
      const res = locationFor(resAPI)
      expect(res).toEqual(loc)
    })

  })

  it('should return a context', () => {
    return fetchWeather({context, entities}).then((context) => {
      expect(context).toBeA('object').toIncludeKeys(['location', 'forecast'])
    })
  })

})
