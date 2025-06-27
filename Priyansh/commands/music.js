const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput (Fixed by ChatGPT)",
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
      return api.sendMessage("❌ براہ کرم گانے کا نام درج کریں۔", event.threadID, event.messageID);
    }

    let type = "audio";
    if (args[args.length - 1].toLowerCase() === "audio" || args[args.length - 1].toLowerCase() === "video") {
      type = args.pop().toLowerCase();
    }
    const searchQuery = args.join(" ");

    const processing = await api.sendMessage("🔍 یوٹیوب پر تلاش کر رہا ہوں...", event.threadID, null, event.messageID);

    try {
      const search = await ytSearch(searchQuery);
      if (!search || !search.videos.length) {
        return api.sendMessage("❌ کوئی نتیجہ نہیں ملا۔", event.threadID, event.messageID);
      }

      const video = search.videos[0];
      const title = video.title.replace(/[^\w\s\-]/gi, "").substring(0, 40);
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const fileName = `${title}_${Date.now()}.${fileExt}`;
      const filePath = path.join(__dirname, "cache", fileName);

      // Create cache folder if not exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const stream = ytdl(video.url, {
        filter: type === "audio" ? "audioonly" : "videoandaudio",
        quality: type === "audio" ? "highestaudio" : "highestvideo"
      });

      const file = fs.createWriteStream(filePath);
      stream.pipe(file);

      await new Promise((resolve, reject) => {
        file.on("finish", resolve);
        file.on("error", reject);
      });

      // Check file size limit (Messenger max ~25MB)
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > 25) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ فائل کا سائز بہت بڑا ہے۔ 25MB سے کم کا گانا تلاش کریں۔", event.threadID, event.messageID);
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        body: `🎵 *Title:* ${video.title}\n🕒 *Duration:* ${video.timestamp}\n🎧 Here is your ${type}:`,
        attachment: fs.createReadStream(filePath),
      }, event.threadID, () => {
        fs.unlinkSync(filePath); // Delete after sending
        api.unsendMessage(processing.messageID); // Remove "searching" message
      }, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(`❌ خرابی: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
