module.exports.config = {
  name: "dpz",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Shahid",
  description: "Search DPZ images using Pinterest keyword",
  commandCategory: "Image",
  usages: "dpz [keyword]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ برائے مہربانی کوئی keyword لکھیں جیسے:\ndpz girl, dpz sad, dpz attitude", event.threadID, event.messageID);

  try {
    const searchQuery = encodeURIComponent(query);
    api.sendMessage(`🔎 "${query}" کے لیے DPZ تلاش کر رہا ہوں...`, event.threadID, event.messageID);

    // Using alternative Pinterest image API (DuckDuckGo image proxy)
    const res = await axios.get(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${searchQuery}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const results = res.data.results;
    if (!results || results.length === 0) {
      return api.sendMessage("⚠️ کوئی تصویر نہیں ملی۔", event.threadID, event.messageID);
    }

    const selected = results.sort(() => 0.5 - Math.random()).slice(0, 6);
    const attachments = [];

    for (let i = 0; i < selected.length; i++) {
      const imgURL = selected[i].image;
      const imgPath = `${__dirname}/cache/dpz-${i}.jpg`;
      const imgData = (await axios.get(imgURL, { responseType: 'arraybuffer' })).data;

      fs.writeFileSync(imgPath, Buffer.from(imgData, 'binary'));
      attachments.push(fs.createReadStream(imgPath).on("end", () => fs.unlinkSync(imgPath)));
    }

    return api.sendMessage({
      body: `🖼️ "${query}" کے لیے DPZ تصویریں یہ رہیں:`,
      attachment: attachments
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error("Error fetching images:", err.message);
    return api.sendMessage("❌ خرابی آ گئی ہے یا Pinterest نے بلاک کر دیا ہے۔ دوبارہ کوشش کریں۔", event.threadID, event.messageID);
  }
};
