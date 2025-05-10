const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const url = require("url");

module.exports = {
  config: {
    name: "tiktok",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Adapted by ChatGPT",
    description: "Auto-detect and download TikTok video from message",
    commandCategory: "Media",
    usages: "",
    cooldowns: 5,
  },

  handleEvent: async function ({ api, event }) {
    const message = event.body;
    if (!message) return;

    const tiktokUrlMatch = message.match(
      /(https?:\/\/)?(www\.)?(vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com)\/[^\s]+/gi
    );

    if (!tiktokUrlMatch || !tiktokUrlMatch.length) return;

    const tiktokUrl = tiktokUrlMatch[0];

    const processingMessage = await api.sendMessage(
      "⏳ Processing TikTok link...",
      event.threadID
    );

    try {
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.data || !response.data.data.play) {
        throw new Error("Invalid response from download API.");
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

        protocol.get(videoUrl, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download. Status code: ${res.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Download error: ${error.message}`));
        });
      });

      await api.sendMessage(
        {
          body: "📥 Here is your TikTok video:",
          attachment: fs.createReadStream(downloadPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        }
      );
    } catch (err) {
      console.error("TikTok error:", err.message);
      api.sendMessage(
        `❌ Error downloading TikTok video: ${err.message}`,
        event.threadID
      );
    }
  },

  run: () => {}, // Required by command handler, but not used
};
