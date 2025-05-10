const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const url = require("url");

module.exports = {
  config: {
    name: "tiktok",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adapted by ChatGPT",
    description: "Download TikTok video by sending the link",
    commandCategory: "Media",
    usages: "[TikTok URL]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const tiktokUrl = args[0];

    if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
      return api.sendMessage(
        "❌ Please provide a valid TikTok URL.",
        event.threadID,
        event.messageID
      );
    }

    const processingMessage = await api.sendMessage(
      "🔄 Downloading TikTok video. Please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // API for TikTok video download (no watermark)
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;

      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.data || !response.data.data.play) {
        throw new Error("Unable to fetch video. The API might be down or the link is invalid.");
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

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          body: "🎬 Here is your TikTok video:",
          attachment: fs.createReadStream(downloadPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath); // Delete after sending
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error("TikTok download error:", error.message);
      api.sendMessage(
        `❌ Failed to download TikTok video: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
