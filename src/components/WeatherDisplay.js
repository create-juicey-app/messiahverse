import { useState, useEffect } from 'react';

export default function WeatherDisplay() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        setError('Failed to load weather');
        console.error(err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getWeatherEmoji = (code) => {
    const codeMap = {
      '01': '☀️',
      '02': '⛅',
      '03': '☁️',
      '04': '☁️',
      '09': '🌧️',
      '10': '🌦️',
      '11': '⛈️',
      '13': '❄️',
      '50': '🌫️',
    };
    return codeMap[code.substring(0, 2)] || '🌡️';
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Rime fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Light rain',
      63: 'Rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Light showers',
      81: 'Showers',
      82: 'Heavy showers',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  };

  const getWeatherDetails = (data) => {
    const details = [
      {
        label: 'Weather Condition',
        value: getWeatherDescription(data.current?.weathercode)
      },
      {
        label: 'Temperature',
        value: `${Math.round(data.main.temp)}°C (Feels like ${Math.round(data.main.feels_like)}°C)`
      },
      {
        label: 'Updated At',
        value: new Date(data.dt * 1000).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Europe/Paris'
        })
      }
    ];
    return details;
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/Paris'
    });
  };

  const getTempIcon = (temp) => {
    if (temp <= 0) return '🥶';
    if (temp <= 10) return '❄️';
    if (temp <= 20) return '😌';
    if (temp <= 25) return '😊';
    if (temp <= 30) return '🌡️';
    return '🔥';
  };

  const getHumidityIcon = (humidity) => {
    if (humidity <= 30) return '🏜️';
    if (humidity <= 50) return '💧';
    if (humidity <= 70) return '💦';
    return '🌊';
  };

  const getConditionIcon = (code) => {
    const iconMap = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Foggy
      48: '❄️', // Rime fog
      51: '🌦️', // Light drizzle
      53: '🌧️', // Drizzle
      55: '⛈️', // Heavy drizzle
      61: '🌧️', // Light rain
      63: '🌧️', // Rain
      65: '⛈️', // Heavy rain
      71: '🌨️', // Light snow
      73: '🌨️', // Snow
      75: '❄️', // Heavy snow
      77: '❄️', // Snow grains
      80: '🌦️', // Light showers
      81: '🌧️', // Showers
      82: '⛈️', // Violent showers
      85: '🌨️', // Snow showers
      86: '❄️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with hail
      99: '🌪️'  // Thunderstorm with heavy hail
    };
    return iconMap[code] || '❓';
  };

  const renderWeatherDetails = () => {
    if (!weather) return null;

    return (
      <div className="bg-black/20 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-slideDown border-t border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded bg-black/20">
            <div className="text-xs sm:text-sm text-gray-400 mb-1">Condition</div>
            <div className="text-sm sm:text-base text-white flex items-center gap-2">
              {getConditionIcon(weather.current?.weathercode)}
              <span>{getWeatherDescription(weather.current?.weathercode)}</span>
            </div>
          </div>
          {weather.main.humidity && (
            <div className="p-2 sm:p-3 rounded bg-black/20">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Humidity</div>
              <div className="text-sm sm:text-base text-white flex items-center gap-2">
                {getHumidityIcon(weather.main.humidity)}
                <span>{Math.round(weather.main.humidity)}%</span>
              </div>
            </div>
          )}
          {weather.main.pressure && (
            <div className="p-2 sm:p-3 rounded bg-black/20">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Pressure</div>
              <div className="text-sm sm:text-base text-white">{Math.round(weather.main.pressure)} hPa</div>
            </div>
          )}
          {weather.wind?.speed && (
            <div className="p-2 sm:p-3 rounded bg-black/20">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Wind</div>
              <div className="text-sm sm:text-base text-white">
                {Math.round(weather.wind.speed)} km/h
                {weather.wind.direction && (
                  <span className="text-xs sm:text-sm text-gray-400 ml-1">
                    {getWindDirection(weather.wind.direction)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="text-center text-xs sm:text-sm text-gray-400">
          Last updated: {new Date(weather.dt * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Paris'
          })}
        </div>
      </div>
    );
  };

  if (error) return null;
  if (!weather) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-medium">Weather</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Europe/Paris'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl">
              {getWeatherEmoji(weather.weather[0].icon)}
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Feels like {Math.round(weather.main.feels_like)}°C
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full mt-4 flex items-center justify-between text-sm text-gray-400 hover:text-gray-300"
        >
          <span>Show Details</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isDetailsOpen && renderWeatherDetails()}
    </div>
  );
}
