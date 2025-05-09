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
    credits: "SAAD AHMAD",
    description: "Download and send TikTok video using a link",
    commandCategory: "Media",
    usages: "[TikTok video link]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const tiktokUrl = args.join(" ");

    if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
      return api.sendMessage(
        "❌ Please provide a valid TikTok video link.",
        event.threadID,
        event.messageID
      );
    }

    const processingMsg = await api.sendMessage(
      "⏳ Downloading TikTok video, please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // Replace this with a real API that gives a direct downloadable URL
      const apiEndpoint = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(tiktokUrl)}`;

      const response = await axios.get(apiEndpoint);
      if (!response.data || !response.data.video || !response.data.video.nowm) {
        throw new Error("❌ Could not retrieve the download link.");
      }

      const videoUrl = response.data.video.nowm;

      const parsed = url.parse(videoUrl);
      const protocol = parsed.protocol === "https:" ? https : http;

      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
      }

      const filename = `tiktok_${Date.now()}.mp4`;
      const filePath = path.join(downloadDir, filename);
      const file = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        protocol.get(videoUrl, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download failed. Status code: ${res.statusCode}`));
          }
        }).on("error", (err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
      });

      // Send the video
      await api.sendMessage(
        {
          attachment: fs.createReadStream(filePath),
          body: "🎬 Here's your TikTok video!",
        },
        event.threadID,
        () => {
          fs.unlinkSync(filePath); // Clean up
          api.unsendMessage(processingMsg.messageID);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage(
        `❌ Error downloading video: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
