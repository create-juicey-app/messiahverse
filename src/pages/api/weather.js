export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Gravelines coordinates
    const lat = 50.9871;
    const lon = 2.1262;
    
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe/Paris`
    );
    
    if (!weatherRes.ok) {
      throw new Error('Weather API error');
    }

    const rawData = await weatherRes.json();
    
    // Convert OpenMeteo format to our needed format
    const weatherData = {
      main: {
        temp: rawData.current.temperature_2m,
        feels_like: rawData.current.apparent_temperature,
        humidity: rawData.current.relative_humidity_2m,
        pressure: rawData.current.surface_pressure
      },
      wind: {
        speed: rawData.current.wind_speed_10m,
        direction: rawData.current.wind_direction_10m
      },
      sun: {
        isDay: rawData.current.is_day,
        sunrise: rawData.daily.sunrise[0],
        sunset: rawData.daily.sunset[0]
      },
      daily: {
        maxTemp: rawData.daily.temperature_2m_max[0],
        minTemp: rawData.daily.temperature_2m_min[0]
      },
      weather: [{
        icon: getWeatherIcon(rawData.current.weathercode)
      }],
      current: {
        weathercode: rawData.current.weathercode,
        precipitation: rawData.current.precipitation,
        windSpeed: rawData.current.windspeed_10m,
        windDirection: rawData.current.winddirection_10m,
        cloudCover: rawData.current.cloudcover
      },
      dt: Math.floor(Date.now() / 1000) // Current timestamp in seconds
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
}

function getWeatherIcon(code) {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs
  const codeMap = {
    0: '01d', // Clear sky
    1: '02d', // Mainly clear
    2: '03d', // Partly cloudy
    3: '04d', // Overcast
    45: '50d', // Foggy
    48: '50d', // Depositing rime fog
    51: '09d', // Light drizzle
    53: '09d', // Moderate drizzle
    55: '09d', // Dense drizzle
    61: '10d', // Slight rain
    63: '10d', // Moderate rain
    65: '10d', // Heavy rain
    71: '13d', // Slight snow
    73: '13d', // Moderate snow
    75: '13d', // Heavy snow
    77: '13d', // Snow grains
    80: '09d', // Slight rain showers
    81: '09d', // Moderate rain showers
    82: '09d', // Violent rain showers
    85: '13d', // Slight snow showers
    86: '13d', // Heavy snow showers
    95: '11d', // Thunderstorm
    96: '11d', // Thunderstorm with slight hail
    99: '11d'  // Thunderstorm with heavy hail
  };
  return codeMap[code] || '01d';
}
