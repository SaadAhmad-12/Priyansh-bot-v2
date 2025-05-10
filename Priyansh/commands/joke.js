const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "joke",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "OpenAI & JokeAPI",
    description: "Fetches a random joke",
    commandCategory: "Fun",
    usages: "joke",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    try {
      // Fetching a random joke from JokeAPI
      const response = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
      const data = await response.json();

      if (data.error) {
        throw new Error("Couldn't fetch a joke. Please try again later.");
      }

      // If joke is a single line
      const joke = data.joke ? data.joke : "Sorry, couldn't fetch a joke right now.";
      
      // Sending the joke to the group
      return api.sendMessage(joke, event.threadID);
    } catch (error) {
      return api.sendMessage("Sorry, something went wrong while fetching a joke.", event.threadID);
    }
  }
};
