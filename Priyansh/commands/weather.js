const axios = require("axios");

module.exports = {
  config: {
    name: "weather",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Your Name",
    description: "Get the current weather of a city.",
    commandCategory: "Information",
    usages: "[cityName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const city = args.join(" "); // Get city name from command arguments
    if (!city) {
      return api.sendMessage("Please provide a city name. Example: `/weather London`", event.threadID);
    }

    const apiKey = "25f94860d0d20fcc6e90c003e18c19e4"; // Your OpenWeatherMap API Key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // Check if the response contains valid weather data
      if (!data || !data.main) {
        throw new Error("Weather data not found.");
      }

      // Extract weather information
      const cityName = data.name;
      const country = data.sys.country;
      const temperature = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;

      // Format and send the weather information
      const weatherMessage = `
      📍 City: ${cityName}, ${country}
      🌡 Temperature: ${temperature}°C
      🌤 Weather: ${weatherDescription}
      💧 Humidity: ${humidity}%
      🌬 Wind Speed: ${windSpeed} m/s
      `;

      api.sendMessage(weatherMessage, event.threadID);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      api.sendMessage(`Could not fetch the weather for this location. Please try again later. Error: ${error.message}`, event.threadID);
    }
  },
};
