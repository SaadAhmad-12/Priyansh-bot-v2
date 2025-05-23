const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");
const http = require("http"); // Added to handle HTTP URLs
const url = require("url"); // Added for parsing URLs

module.exports = {
  config: {
    name: "music",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Download YouTube song from keyword search and link",
    commandCategory: "Media",
    usages: "[songName] [type]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
  },

  run: async function ({ api, event, args }) {
    let songName, type;

    if (
      args.length > 1 &&
      (args[args.length - 1] === "audio" || args[args.length - 1] === "video")
    ) {
      type = args.pop();
      songName = args.join(" ");
    } else {
      songName = args.join(" ");
      type = "audio";
    }

    const processingMessage = await api.sendMessage(
      "✅ Processing your request. Please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(songName);
      console.log(searchResults); // Debug: Check search results

      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      // Get the top result from the search
      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;

      console.log("Top Result:", topResult); // Debug: Check the top result

      // Construct API URL for downloading the top result
      const apiKey = "priyansh-here";
      const apiUrl = `https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;

      // Get the direct download URL from the API
      const downloadResponse = await axios.get(apiUrl);
      console.log(downloadResponse.data); // Debug: Check API response

      const downloadUrl = downloadResponse.data.downloadUrl;

      // Validate if downloadUrl exists
      if (!downloadUrl) {
        throw new Error("Failed to get download URL from the API.");
      }

      // Set the filename based on the song title and type
      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9 \-_]/g, ""); // Clean the title
      const filename = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      // Ensure the directory exists
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // Sanitize the download URL to handle both HTTP and HTTPS protocols
      const secureUrl = downloadUrl.replace(/^http:\/\//i, "https://");

      // Download the file and save locally
      const file = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        // Check the protocol and choose the appropriate method
        const downloadUrlParsed = url.parse(secureUrl); 
        const protocol = downloadUrlParsed.protocol === "https:" ? https : http;

        protocol.get(secureUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(
              new Error(`Failed to download file. Status code: ${response.statusCode}`)
            );
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // Send the downloaded file to the user
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🖤 Title: ${topResult.title}\n\n Here is your ${type === "audio" ? "audio" : "video"} 🎧:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath); // Cleanup after sending
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(
        `Failed to download song: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
