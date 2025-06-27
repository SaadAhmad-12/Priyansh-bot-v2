const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");
const http = require("http");
const url = require("url");

module.exports = {
  config: {
    name: "song",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 (Modified by ChatGPT)",
    description: "Download YouTube audio/video using keywords or link",
    commandCategory: "Media",
    usages: "[song name] [audio|video]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
  },

  run: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);
    }

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
      "⏳ Searching and preparing your song. Please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("❌ No results found.");
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;
      const title = topResult.title;
      const apiKey = "priyansh-here";

      const apiUrl = `https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;
      const downloadResponse = await axios.get(apiUrl);

      const downloadUrl = downloadResponse.data.downloadUrl;

      if (!downloadUrl) {
        throw new Error("⚠️ Could not retrieve the download link.");
      }

      const safeTitle = title.replace(/[^a-zA-Z0-9 \-_]/g, "");
      const filename = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const parsedUrl = url.parse(downloadUrl);
      const protocol = parsedUrl.protocol === "https:" ? https : http;

      const file = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        protocol.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
          }
        }).on("error", (err) => {
          fs.unlinkSync(downloadPath);
          reject(err);
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 Title: ${title}\nHere is your ${type}:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (err) {
      console.error("Error:", err.message);
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};