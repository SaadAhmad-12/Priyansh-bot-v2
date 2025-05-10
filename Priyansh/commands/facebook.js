const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const url = require("url");

module.exports = {
  config: {
    name: "facebook",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adapted by ChatGPT",
    description: "Auto-detect Facebook video links and send the video",
    commandCategory: "Media",
    usages: "",
    cooldowns: 5,
  },

  handleEvent: async function ({ api, event }) {
    const message = event.body;
    if (!message) return;

    const fbLinkMatch = message.match(
      /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/gi
    );
    if (!fbLinkMatch || !fbLinkMatch.length) return;

    const fbUrl = fbLinkMatch[0];

    const processingMessage = await api.sendMessage(
      "🔄 Fetching Facebook video. Please wait...",
      event.threadID
    );

    try {
      // Replace with any reliable Facebook download API
      const apiUrl = `https://fb-video-downloader-api.vercel.app/api?url=${encodeURIComponent(fbUrl)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.success || !response.data.url) {
        throw new Error("Unable to retrieve video. The API may be down or invalid link.");
      }

      const videoUrl = response.data.url;
      const filename = `fb_${Date.now()}.mp4`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const file = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        const parsedUrl = url.parse(videoUrl);
        const protocol = parsedUrl.protocol === "https:" ? https : http;

        protocol.get(videoUrl, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
          } else {
            reject(new Error(`Download failed. Status code: ${res.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading: ${error.message}`));
        });
      });

      await api.sendMessage(
        {
          body: "📽️ Here is your Facebook video:",
          attachment: fs.createReadStream(downloadPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        }
      );
    } catch (err) {
      console.error("Facebook download error:", err.message);
      api.sendMessage(
        `❌ Error downloading Facebook video: ${err.message}`,
        event.threadID
      );
    }
  },

  run: () => {}, // Required by command handler
};
