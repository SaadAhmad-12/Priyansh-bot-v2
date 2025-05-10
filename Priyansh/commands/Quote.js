const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "quote",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Saad Ahmad",
    description: "Fetches a random quote",
    commandCategory: "Fun",
    usages: "quote",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    try {
      // Fetching a random quote from the Quotable API
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();

      if (data.error) {
        throw new Error("Couldn't fetch a quote. Please try again later.");
      }

      const quote = `"${data.content}"\n— ${data.author}`;

      // Send the quote to the group
      return api.sendMessage(quote, event.threadID);
    } catch (error) {
      return api.sendMessage("Sorry, something went wrong while fetching a quote.", event.threadID);
    }
  }
};
