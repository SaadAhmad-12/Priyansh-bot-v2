const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    version: "1.2.1",
    hasPermssion: 0,
    credits: "Priyansh Rajput (Fixed by ChatGPT)",
    description: "Download YouTube audio/video by name",
    commandCategory: "Media",
    usages: "[song name] [audio/video]",
    cooldowns: 5,
    dependencies: {
      "yt-search": "",
      "ytdl-core": ""
    },
  },

  run: async function ({ api, event, args }) {
    try {
      if (!args.length) {
        return api.sendMessage("❌ برائے مہربانی گانے کا نام لکھیں۔", event.threadID, event.messageID);
      }

      let type = "audio";
      const lastArg = args[args.length - 1].toLowerCase();
      if (["audio", "video"].includes(lastArg)) {
        type = args.pop().toLowerCase();
      }

      const query = args.join(" ");
      const waiting = await api.sendMessage("🔍 گانا تلاش کیا جا رہا ہے...", event.threadID, null, event.messageID);

      const searchResult = await ytSearch(query);
      const video = searchResult.videos[0];

      if (!video) {
        return api.sendMessage("❌ ویڈیو نہیں ملی، دوبارہ کوشش کریں۔", event.threadID, event.messageID);
      }

      const safeTitle = video.title.replace(/[\/\\?%*:|"<>]/g, "").substring(0, 40);
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const fileName = `${safeTitle}_${Date.now()}.${fileExt}`;
      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, fileName);

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const streamOptions = {
        filter: type === "audio" ? "audioonly" : "audioandvideo",
        quality: type === "audio" ? "highestaudio" : "highest"
      };

      const stream = ytdl(video.url, streamOptions);
      const fileStream = fs.createWriteStream(filePath);

      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("⏳ ڈاؤنلوڈ میں تاخیر ہو رہی ہے۔")), 40000);
      });

      const download = new Promise((resolve, reject) => {
        stream.pipe(fileStream);
        stream.on("error", reject);
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });

      await Promise.race([download, timeout]);

      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 25) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ فائل کا سائز بہت زیادہ ہے (25MB سے زیادہ)۔", event.threadID, event.messageID);
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        body: `🎵 ${video.title}\n⏱️ دورانیہ: ${video.timestamp}\n🎧 آپ کا ${type} فائل تیار ہے۔`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(waiting.messageID);
      }, event.messageID);

    } catch (err) {
      console.error("Download Error:", err);
      return api.sendMessage(`❌ مسئلہ: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
