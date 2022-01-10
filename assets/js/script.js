var searchHistoryList = document.querySelector("#previous-searches");


var currentEl = document.querySelector("#current-weather");
var forecastContainer = document.querySelector("#forecast-card-container");
var forecastEl = document.querySelector("#forecast-title");
var searchInputEl = document.querySelector("#search");
var searchForm = document.querySelector("#search-form");
var searchBtn = document.querySelector("#search-btn");
var storedSearches = [];

var displaySearchHistory = function(storedSearchesArray) {
    
    searchHistoryList.textContent = "";

    for (i = 0; i < storedSearchesArray.length; i++) {
        var historyBtn = document.createElement("button");
        historyBtn.className = "history-btn my-2 rounded-lg";
        historyBtn.textContent = storedSearchesArray[i];
        searchHistoryList.appendChild(historyBtn);
    }
};

var historyGetCurrent = function(searchCity) {
    currentEl.textContent = "";
    forecastContainer.textContent = "";
    forecastEl.textContent = "";
    getCurrent(searchCity);
};


var getLocalStorage = function() {
    storedSearches = JSON.parse(localStorage.getItem("searches"));
    if (!storedSearches) {
        storedSearches = [];
    } else {
        displaySearchHistory(storedSearches);
    }
};

getLocalStorage();

var formSubmitHandler = function(event) {
    event.preventDefault();

    currentEl.textContent = "";
    forecastContainer.textContent = "";
    forecastEl.textContent = "";
    var searchCity = searchInputEl.value.trim();

    if (searchCity) {
        searchInputEl.value = "";
        storeSearch(searchCity);
        getCurrent(searchCity);
    } else {
        alert("Please enter a city!");
    } 
};

var storeSearch = function(city) {
    if (!storedSearches.includes(city)) {
        storedSearches.push(city);
        localStorage.setItem("searches", JSON.stringify(storedSearches));
        displaySearchHistory(storedSearches);
    }
};


var getCurrent = function(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=99f14c2b59be30daaf3ec1992936f02d&units=imperial";
    
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json()
                    .then(function(data) {
                        var latitude = data.coord.lat;
                        var longitude = data.coord.lon;
                        displayCurrent(data, latitude, longitude); //add fcn to display current conditions here --> something like displayCurrent(data)
                        getForecast(latitude, longitude);
                    })
            } else {
                storedSearches.pop();
                localStorage.setItem("searches", JSON.stringify(storedSearches));
                displaySearchHistory(storedSearches);
                alert("Please enter a valid city!");
            }
    })
}


var getCurrentUVI = function(latitude, longitude) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=99f14c2b59be30daaf3ec1992936f02d&exclude=minutely,hourly,alerts";
    
    
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json()
                    .then(function(data) {
                        var currentUVI = data.current.uvi;
                        var currentUVIEl = document.createElement("p");
                        var currentUVISpan = document.createElement("span");
                        currentUVISpan.textContent = currentUVI;
                        if (currentUVI <= 2) {
                            currentUVISpan.className = "bg-success text-white px-2 py-1";
                        } else if (2 < currentUVI < 6) {
                            currentUVISpan.className = "bg-warning px-2 py-1";
                        } else {
                            currentUVISpan.className = "bg-danger text-white px-2 py-1";
                        }
                        currentUVIEl.className = "ml-2";
                        currentUVIEl.textContent = "UV Index: ";
                        currentUVIEl.append(currentUVISpan); 
                        currentEl.appendChild(currentUVIEl);
                    })
            } else {
                return;
            }
        })
}

var getForecast = function(latitude, longitude) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=99f14c2b59be30daaf3ec1992936f02d&exclude=current,minutely,hourly,alerts&units=imperial";

    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json()
                    .then(function(data) {
                        
                        displayForecast(data);
                    }) 
            } else {
                return;
            }
        })
}

// Displays current weather from API
var displayCurrent = function(current, lat, lon) {
    
    var cityName = current.name;
    var date = new Date();
    var [month, day, year] = [[date.getMonth() + 1], date.getDate(), date.getFullYear()];

    var cityDateIconEl = document.createElement("h3");
    date = "(" + month + "/" + day + "/" + year + ")";
    cityDateIconEl.className = "ml-2";
    cityDateIconEl.textContent = cityName + " " + date; //+ " " + weatherIcon;
    currentEl.appendChild(cityDateIconEl);

    // get temp
    var temp = current.main.temp
    var tempEl = document.createElement("p");
    tempEl.className = "ml-2";
    tempEl.textContent = "Temp: " + temp + "°F";
    currentEl.appendChild(tempEl);

    // get wind
    var wind = current.wind.speed;
    var windEl = document.createElement("p");
    windEl.className = "ml-2";
    windEl.textContent = "Wind: " + wind + " MPH";
    currentEl.appendChild(windEl);

    // get humidity
    var humidity = current.main.humidity;
    var humidityEl = document.createElement("p");
    humidityEl.className = "ml-2";
    humidityEl.textContent = "Humidity: " + humidity + " %";
    currentEl.appendChild(humidityEl);

    // UV
    getCurrentUVI(lat, lon);
}

var displayForecast = function(forecast) {
    forecastEl.textContent = "5-Day Forecast:";

    for (i = 1; i < 6; i++) {
        // Forecast container
        var forecastCard = document.createElement("div")
        forecastCard.className = "bg-secondary text-white border p-2 m-2"

        //icon 
        var weatherIcon = document.createElement("img");
        weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${forecast.daily[i].weather.icon}@2x.png`);
        forecastCard.appendChild(weatherIcon);


        // Current Date
        var unixTimeStamp = forecast.daily[i].dt;
        var milliseconds = unixTimeStamp * 1000;
        var dateObject = new Date(milliseconds);
        var [month, day, year] = [[dateObject.getMonth() + 1], dateObject.getDate(), dateObject.getFullYear()]
        var date = month + "/" + day + "/" + year;
        var dateEl = document.createElement("p")
        dateEl.className = "font-weight-bold";
        dateEl.textContent = date;
        forecastCard.appendChild(dateEl)

        // Temperature:
        var temp = forecast.daily[i].temp.day;
        var tempEl = document.createElement("p");
        tempEl.className = "font-weight-bold";
        tempEl.textContent = "Temp: " + temp + "°F";
        forecastCard.appendChild(tempEl);
        
        // Wind:
        var wind = forecast.daily[i].wind_speed;
        var windEl = document.createElement("p")
        windEl.className = "font-weight-bold";
        windEl.textContent = "Wind: " + wind + " MPH";
        forecastCard.appendChild(windEl);

        // Humidity: 
        var humidity = forecast.daily[i].humidity;
        var humidityEl = document.createElement("p");
        humidityEl.className = "font-weight-bold";
        humidityEl.textContent = "Humidity: " + humidity + "%";
        forecastCard.appendChild(humidityEl);

        forecastContainer.appendChild(forecastCard);
    }
    
};

searchForm.addEventListener("submit", formSubmitHandler);

searchHistoryList.addEventListener("click", function(evt) {
    if (evt.target.classList.contains('history-btn')) {
        currentEl.textContent = "";
        forecastContainer.textContent = "";
        forecastEl.textContent = "";
        var searchCity = evt.target.innerHTML;

        storeSearch(searchCity);
        getCurrent(searchCity);
    }
});