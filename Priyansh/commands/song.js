const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    version: "1.2.0",
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
    if (!args.length) {
      return api.sendMessage("❌ گانے کا نام لکھیں۔", event.threadID, event.messageID);
    }

    let type = "audio";
    if (["audio", "video"].includes(args[args.length - 1].toLowerCase())) {
      type = args.pop().toLowerCase();
    }

    const query = args.join(" ");
    const waitMsg = await api.sendMessage("🔍 تلاش جاری ہے...", event.threadID, null, event.messageID);

    try {
      const searchResult = await ytSearch(query);
      const video = searchResult.videos[0];
      if (!video) return api.sendMessage("❌ کوئی ویڈیو نہیں ملی۔", event.threadID, event.messageID);

      const title = video.title.replace(/[^\w\s\-]/gi, "").substring(0, 40);
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const fileName = `${title}_${Date.now()}.${fileExt}`;
      const filePath = path.join(__dirname, "cache", fileName);

      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }

      const streamOptions = {
        filter: type === "audio" ? "audioonly" : "videoandaudio",
        quality: type === "audio" ? "highestaudio" : "highest"
      };

      const stream = ytdl(video.url, streamOptions);
      const fileStream = fs.createWriteStream(filePath);

      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("⏳ ویڈیو ڈاؤنلوڈ میں بہت دیر لگ رہی ہے۔")), 30000); // 30 sec
      });

      const download = new Promise((resolve, reject) => {
        stream.pipe(fileStream);
        fileStream.on("finish", resolve);
        stream.on("error", reject);
        fileStream.on("error", reject);
      });

      await Promise.race([download, timeout]);

      // Check size
      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ فائل بہت بڑی ہے (25MB سے زیادہ)۔", event.threadID, event.messageID);
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        body: `🎵 *${video.title}*\n🕒 *${video.timestamp}*\n🎧 Here is your ${type}:`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(waitMsg.messageID);
      }, event.messageID);

    } catch (err) {
      console.error("ERROR:", err);
      return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
