const api = 'http://api.openweathermap.org/data/2.5/weather?'
const apikey = '&APPID=f814d0e4585b1589c7589c972e5e1cb7'
let intervalid
let tmp

function appload () {
  'use strict'
  // var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/' // 'http://api.openweathermap.org/data/2.5/weather?'

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  }

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function () {
    app.updateForecasts()
  })

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function () {
    // Open/show the add new city dialog
    app.toggleAddDialog(true)
  })

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddCity').addEventListener('click', function () {
    var cityname = document.getElementById('cityname').value
    getData(cityname)
    app.toggleAddDialog(false)
  })

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function () {
    app.toggleAddDialog(false)
  })

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible')
    } else {
      app.addDialog.classList.remove('dialog-container--visible')
    }
  }

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function (data) {
    console.log(data)
    var card = app.visibleCards[data.name]
    if (!card) {
      card = app.cardTemplate.cloneNode(true)
      card.classList.remove('cardTemplate')
      card.querySelector('.location').textContent = data.name
      card.removeAttribute('hidden')
      app.container.appendChild(card)
      console.log(data.id)
      app.selectedCities.push({label: data.name })
      app.saveSelectedCities()
      app.visibleCards[data.name] = card
    }

    var dateElem = card.querySelector('.date')
    if (dateElem.getAttribute('data-dt') >= data.dt) {
      return
    }

    var img = {
      '01d': 'oned',
      '02d': 'twod',
      '03d': 'threed',
      '04d': 'fourd',
      '09d': 'fived',
      '10d': 'tend',
      '11d': 'ed',
      '13d': 'third',
      '01n': 'onen',
      '02n': 'twon',
      '03n': 'threen',
      '04n': 'fourn',
      '10n': 'tenn',
      '11n': 'en',
      '13n': 'thirn',
      '50d': 'fifd',
      '50n': 'fifn'
    }

    dateElem.setAttribute('data-dt', data.dt)
    dateElem.textContent = new Date(data.dt * 1000)

    card.querySelector('.description').textContent = data.weather[0].description // data.currently.summary
    card.querySelector('.date').textContent =
      new Date(data.dt * 1000)
    card.querySelector('.current .icon').classList.add(img[data.weather[0].icon])
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.main.temp - 273.15)
    card.querySelector('.current .pressure').textContent = data.main.pressure + 'hPa'
    card.querySelector('.current .humidity').textContent = data.main.humidity + '%'
    card.querySelector('.current .wind .value').textContent = data.wind.speed

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true)
      app.container.removeAttribute('hidden')
      app.isLoading = false
    }
  }

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function (cityname) {
    var url = api + 'q=' + cityname + apikey
    if ('caches' in window) {
      caches.match(url).then(function (response) {
        if (response) {
          response.json().then(function (json) {
            json.label = cityname
            app.updateForecastCard(json)
          })
        }
      })
    }
    // Make the XHR to get the data, then update the card
    sendRequest(url)
  }

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function () {
    var keys = Object.keys(app.visibleCards)
    keys.forEach(function (key) {
      app.getForecast(key)
    })
  }

  app.saveSelectedCities = function () {
    window.localforage.setItem('selectedCities', app.selectedCities)
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.localforage.getItem('selectedCities', function (err, cityList) {
      if (cityList) {
        app.selectedCities = cityList
        app.selectedCities.forEach(function (city) {
          console.log(city.label)
          app.getForecast(city.label)
        })
      } else {
        getLoc()
      }
    })
  })

  function getLoc () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition)
    } else {
      alert('Enter city name')
    }
  }

  function showPosition (position) {
    let lat = position.coords.latitude
    let lon = position.coords.longitude
    let url = api + 'lat=' + lat + '&lon=' + lon + apikey
    sendRequest(url)
  }

  function getData (cityname) {
    if (cityname !== null) {
      let url = api + 'q=' + cityname + apikey
      sendRequest(url)
    }
  }

  function sendRequest (url) {
    tmp = setInterval(function () {
      let xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          var data = JSON.parse(xhttp.responseText)
          app.updateForecastCard(data)
        }
      }
      xhttp.open('GET', url, true)
      xhttp.send()
    }, 3000)
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(function () {
        console.log('Service Worker Registered')
      })
  }
}

appload()
