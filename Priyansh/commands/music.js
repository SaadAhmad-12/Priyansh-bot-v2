const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput (Modified by ChatGPT)",
    description: "Download YouTube audio or video by name",
    commandCategory: "Media",
    usages: "[song name] [audio/video]",
    cooldowns: 5,
    dependencies: {
      "yt-search": "",
      "ytdl-core": ""
    },
  },

  run: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("❌ Please enter a song name.", event.threadID, event.messageID);
    }

    let type = "audio";
    if (args[args.length - 1] === "audio" || args[args.length - 1] === "video") {
      type = args.pop();
    }
    const searchQuery = args.join(" ");

    const processing = await api.sendMessage("🔍 Searching YouTube for your song...", event.threadID, null, event.messageID);

    try {
      const search = await ytSearch(searchQuery);
      if (!search || !search.videos.length) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      const video = search.videos[0];
      const title = video.title.replace(/[^\w\s-]/gi, "");
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const fileName = `${title}.${fileExt}`;
      const filePath = path.join(__dirname, "cache", fileName);

      // Ensure "cache" directory exists
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }

      const stream = ytdl(video.url, {
        filter: type === "audio" ? "audioonly" : "videoandaudio",
        quality: type === "audio" ? "highestaudio" : "highest"
      });

      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        stream.pipe(file);
        file.on("finish", resolve);
        file.on("error", reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        body: `🎵 Title: ${video.title}\n🕒 Duration: ${video.timestamp}\n🎧 Here is your ${type}:`,
        attachment: fs.createReadStream(filePath),
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(processing.messageID);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};