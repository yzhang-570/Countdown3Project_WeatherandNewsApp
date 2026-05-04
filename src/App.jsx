import { useState, useEffect } from 'react'
import './App.css'
import InputField from './components/InputField.jsx'
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';

function App() {

  useEffect(() => {
    const getWeatherData = async () => {
      const newWeatherURL = new URL('https://api.tomorrow.io/v4/weather/forecast?location=new%20york');
      newWeatherURL.searchParams.append("apikey", import.meta.env.VITE_TOMORROWAPI_KEY);
      const response3 = await fetch(newWeatherURL);
      const data3 = await response3.json();
      console.log(data3);
    }
    getWeatherData();
  }, [])
  const [weatherData, setWeatherData] = useState({}); // {latitude: [value], longitude: [value]}

  /* Input Field State */
  const [city, setCity] = useState(''); // city text input
  const [stateCode, setStateCode] = useState(''); // state code text input
  const [countryCode, setCountryCode] = useState(''); // country code text input

  const [feedbackStatus, setFeedbackStatus] = useState(null); // null | 'success' | 'fail' | 'loading'
  const [feedbackMessage, setFeedbackMessage] = useState(''); // after submitting city input

  const getWeatherData = async () => {
    try {

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
      currWeatherURL.searchParams.append("units", "imperial");
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
      setCity('')
      setStateCode('')
      setCountryCode('')
      setFeedbackStatus('success');
      setFeedbackMessage('Success!');
    }
    catch (error) {
      console.log('error: ' + error);
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

  const getCurrentTime = () => {
    const hours = new Date().getHours().toString();
    const minutes = new Date().getMinutes().toString().padStart(2, "0");
    const isPM = hours - 12 >= 0

    if (isPM && hours === '12') {
      return hours + ":" + minutes + 'PM';
    }
    else if (isPM) {
      return hours - 12 + ":" + minutes + 'PM';
    }
    else {
      return hours + ":" + minutes + 'AM';
    }
  }
  console.log(weatherData);

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
            <h1>{weatherData.currentTemp} (F)</h1>
            {weatherData && <img className="weather-icon-img" src={weatherData.weatherIconURL}/>}
            <p>{weatherData.weatherDesc}</p>
            <h3>{weatherData.city}</h3>
            <p>{getCurrentTime()} | H: {weatherData.highestTemp} L: {weatherData.lowestTemp}</p>
          </div>

          <div className="column future-weather-div">
            
            {/* Any weather info of choice - or news (?) */}
            <div className="card">
              temp
            </div>

            {/* 7-day forecast */}
            <div className="card five-day-forecast-div column">
              <p><b>7-day forecast</b></p>
              <div className="row singleday-forecast-div">
                <p>Today</p>
                Icon
                <p>low</p>
                <p>a bar</p>
                <p>high</p>
              </div>
              <div className="row singleday-forecast-div">
                <p>Today</p>
                Icon
                <p>low</p>
                <p>a bar</p>
                <p>high</p>
              </div>
              <div className="row singleday-forecast-div">
                <p>Today</p>
                Icon
                <p>low</p>
                <p>a bar</p>
                <p>high</p>
              </div>
              <div className="row singleday-forecast-div">
                <p>Today</p>
                Icon
                <p>low</p>
                <p>a bar</p>
                <p>high</p>
              </div>
            </div>
          </div>
          </div>

      </div>
    </>
  )
}

export default App
