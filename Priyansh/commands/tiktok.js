const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const url = require("url");

module.exports = {
  config: {
    name: "tiktok-autodetect",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Adapted by ChatGPT",
    description: "Auto-download TikTok video when a link is sent",
    commandCategory: "Media",
    usages: "[TikTok URL only in message]",
    cooldowns: 3,
    isEvent: true // important: this makes it run on every message
  },

  handleEvent: async function ({ api, event }) {
    const message = event.body;
    if (!message) return;

    const tiktokRegex = /(https?:\/\/(?:www\.)?tiktok\.com\/[^\s]+)/i;
    const match = message.match(tiktokRegex);

    if (!match) return;

    const tiktokUrl = match[1];

    const processingMessage = await api.sendMessage(
      "🔄 Downloading TikTok video. Please wait...",
      event.threadID
    );

    try {
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.data || !response.data.data.play) {
        throw new Error("Unable to fetch video from API.");
      }

      const videoUrl = response.data.data.play;
      const filename = `tiktok_${Date.now()}.mp4`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const file = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        const parsedUrl = url.parse(videoUrl);
        const protocol = parsedUrl.protocol === "https:" ? https : http;

        protocol.get(videoUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download video. Status code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading video: ${error.message}`));
        });
      });

      await api.sendMessage(
        {
          body: "🎬 Here is your TikTok video:",
          attachment: fs.createReadStream(downloadPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath); // cleanup
          api.unsendMessage(processingMessage.messageID);
        }
      );
    } catch (error) {
      console.error("TikTok download error:", error.message);
      api.sendMessage(
        `❌ Failed to download TikTok video: ${error.message}`,
        event.threadID
      );
    }
  },

  run: () => {} // Not used in event mode
};
