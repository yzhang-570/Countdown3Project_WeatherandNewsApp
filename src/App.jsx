import { useState, useEffect } from 'react'
import './App.css'
import InputField from './components/InputField.jsx'
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';

function App() {

  // Load news
  useEffect(() => {
    const getNewsData = async () => {
      const newsURL = new URL(`https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json`);
      newsURL.searchParams.append('api-key', import.meta.env.VITE_NYTIMES_KEY)
      const response = await fetch(newsURL);
      const data = await response.json();

      console.log(data);
    }
  }, [])

  const [weatherData, setWeatherData] = useState({}); // {latitude: [value], longitude: [value]}
  const [hourlyWeatherData, setHourlyWeatherData] = useState([]);
  const [weeklyWeatherData, setWeeklyWeatherData] = useState([]);

  /* Input Field State */
  const [city, setCity] = useState(''); // city text input
  const [stateCode, setStateCode] = useState(''); // state code text input
  const [countryCode, setCountryCode] = useState(''); // country code text input

  const [feedbackStatus, setFeedbackStatus] = useState(null); // null | 'success' | 'fail' | 'loading'
  const [feedbackMessage, setFeedbackMessage] = useState(''); // after submitting city input

  const [hourlyPage, setHourlyPage] = useState(0);
  const HOURS_PER_PAGE = 5;

  const getWeatherData = async () => {
    try {

      // ---------------GET CURRENT WEATHER
      /* get geocoordinates (lat, lon) */
      const geoURL = new URL("http://api.openweathermap.org/geo/1.0/direct");

      // TODO: format/validate city input w/ the function
      geoURL.searchParams.append("q", `${city},${stateCode},${countryCode}`); // city, state code, country code
      geoURL.searchParams.append("limit", "1");
      geoURL.searchParams.append("appid", import.meta.env.VITE_WEATHERAPI_KEY);

      const response1 = await fetch(geoURL);
      const data1 = await response1.json();
      // console.log(data1);

      /* get weather data */
      const currWeatherURL = new URL("https://api.openweathermap.org/data/2.5/weather")
      currWeatherURL.searchParams.append("lat", data1[0].lat);
      currWeatherURL.searchParams.append("lon", data1[0].lon);
      currWeatherURL.searchParams.append("units", "metric");
      currWeatherURL.searchParams.append("appid", import.meta.env.VITE_WEATHERAPI_KEY);
      const response2 = await fetch(currWeatherURL);
      const data2 = await response2.json();
      console.log(data2);

      setWeatherData(
        {
          "city": data1[0].name,
          "latitude": data1[0].lat,
          "longitude": data1[0].lon,
          "currentTemp": data2.main.feels_like,
          "highestTemp": data2.main.temp_max,
          "lowestTemp": data2.main.temp_min,
          "weatherDesc": data2.weather[0].description,
          "weatherIconURL": `https://openweathermap.org/payload/api/media/file/${data2.weather[0].icon}.png`
        }
      );

      // ---------------GET HOURLY AND WEEKLY WEATHER
      const newWeatherURL = new URL('https://api.tomorrow.io/v4/weather/forecast');
      newWeatherURL.searchParams.append("location", city.toString());
      newWeatherURL.searchParams.append("apikey", import.meta.env.VITE_TOMORROWAPI_KEY);
      const response3 = await fetch(newWeatherURL);
      const data3 = await response3.json();
      // console.log(data3);

      // hourly next day: [{hour: X, temperature: X}]
      const hourlyTemp = [];
      const fullHourlyData = data3.timelines.hourly;
      for (let i = 0; i < 25; i++) {
        hourlyTemp.push({
          // 'time': fullHourlyData[i].time,
          'hour': getFormattedTime(new Date(fullHourlyData[i].time)),
          'temperature': fullHourlyData[i].values.temperature
        });
      }
      // console.log(hourlyTemp);
      setHourlyWeatherData(hourlyTemp);

      // next 7 days: [{date: X, lowestTemp: X, highestTemp: X}]
      const temperatureNext7Days = data3.timelines.daily.map(temperatureData => (
        {
          'dayOfWeek': numToDayOfWeek(new Date(temperatureData.time).getDay()),
          'lowestTemp': temperatureData.values.temperatureMin,
          'highestTemp': temperatureData.values.temperatureMax,
          'date': temperatureData.time
        }
      ));

      temperatureNext7Days[0].dayOfWeek = 'Today';
      // console.log(temperatureNext7Days);
      setWeeklyWeatherData(temperatureNext7Days);

      setHourlyPage(0);
      setCity('')
      setStateCode('')
      setCountryCode('')
      setFeedbackStatus('success');
      setFeedbackMessage('Success!');
    }
    catch (error) {
      console.log('error: ' + error + 'when fetching current weather');
      setFeedbackStatus('fail');
      setFeedbackMessage('An error occurred.');
    }
  }

  const handleGetWeatherClick = () => {
    if (!city || city.trim() === '') {
      setFeedbackStatus('fail');
      setFeedbackMessage('Please enter a city.');
      return;
    }
    getWeatherData();
    setFeedbackStatus('loading');
    setFeedbackMessage('Fetching weather data...');
  }

  const getFormattedTime = (dateObject) => {
    const hours = dateObject.getHours().toString();
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");
    const isPM = hours - 12 >= 0

    if (isPM && hours === '12') {
      return hours + ":" + minutes + 'PM';
    }
    else if (isPM) {
      return hours - 12 + ":" + minutes + 'PM';
    }
    else if(hours === '0') {
      return 12 + ":" + minutes + 'AM';
    }
    else {
      return hours + ":" + minutes + 'AM';
    }
  }
  console.log(weatherData);

  const numToDayOfWeek = (num) => {
    const dayOfWeekMap = {
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday'
    }

    return dayOfWeekMap[num.toString()];
  }

  console.log(hourlyWeatherData);
  console.log(weeklyWeatherData);

  return (
    <>
      <div className="main">
        <div className="inputfields-div">
          <h1>Weather and News</h1>

          <InputField labelText="City Name*"
            stateValue={city} setStateValue={setCity} fieldId="cityInput" setFeedbackMessage={setFeedbackMessage}/>

          <InputField labelText="State Code (optional)"
            stateValue={stateCode} setStateValue={setStateCode} fieldId="stateCodeInput" setFeedbackMessage={setFeedbackMessage}/>

          <InputField labelText="Country Code (optional)"
            stateValue={countryCode} setStateValue={setCountryCode} fieldId="countryCodeInput" setFeedbackMessage={setFeedbackMessage}/>
            
          <Button size="small" variant="contained" onClick={handleGetWeatherClick}>Get Weather</Button>
          <p style={{ color: { success: 'green', fail: 'red', loading: 'gray' }[feedbackStatus] }}>{feedbackMessage}</p>
        </div>

        {/* Today's weather info */}
        <div className="weather-main row">
          <div className="card">
            <h1>{weatherData.currentTemp}°C</h1>
            {weatherData && <img className="weather-icon-img" src={weatherData.weatherIconURL}/>}
            <p>{weatherData.weatherDesc}</p>
            <h3>{weatherData.city}</h3>
            <p>{getFormattedTime(new Date())} | H: {weatherData.highestTemp} L: {weatherData.lowestTemp}</p>
          </div>

          <div className="column future-weather-div">
            
            {/* Hourly forecast for next day */}
            <div className="card hourly-forecast-main column">
              <p><b>Hourly forecast</b></p>
              <div className="hourly-forecast-div row">
                {hourlyWeatherData
                  .slice(hourlyPage * HOURS_PER_PAGE, (hourlyPage + 1) * HOURS_PER_PAGE)
                  .map(weatherData => (
                    <div key={weatherData.hour} className="column single-hour-forecast-div" key={weatherData.hour}>
                      <h3>{weatherData.temperature}°C</h3>
                      <p>{weatherData.hour}</p>
                    </div>
                  ))}
              </div>

              {/* Pagination Buttons */}
              {hourlyWeatherData.length > HOURS_PER_PAGE && (
                <div className="hourly-pagination row">
                  <button
                    className="pagination-btn"
                    onClick={() => setHourlyPage(p => p - 1)}
                    disabled={hourlyPage === 0}
                  >&#8249;</button>
                  <span className="pagination-label">
                    {hourlyPage + 1} / {Math.ceil(hourlyWeatherData.length / HOURS_PER_PAGE)}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setHourlyPage(p => p + 1)}
                    disabled={(hourlyPage + 1) * HOURS_PER_PAGE >= hourlyWeatherData.length}
                  >&#8250;</button>
                </div>
              )}
            </div>

            {/* 7-day forecast */}
            <div className="card seven-day-forecast-div column">
              <p><b>7-day forecast</b></p>
              {weeklyWeatherData.map(weatherData => (
                <div key={weatherData.date} className="row singleday-forecast-div">
                  <p>{weatherData.dayOfWeek}</p>
                  <p>Low: {weatherData.lowestTemp}</p>
                  <p>High: {weatherData.highestTemp}</p>
                </div>
              ))}
            </div>
          </div>
          </div>

      </div>
    </>
  )
}

export default App
