module.exports.config = {
  name: "dpz",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Shahid + ChatGPT",
  description: "Search DPZ",
  commandCategory: "Image",
  usages: "dpz [keyword]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "cheerio": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const cheerio = global.nodemodule["cheerio"];

  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ براہ کرم کوئی لفظ لکھیں جیسے: dpz girl", event.threadID, event.messageID);

  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;

  try {
    api.sendMessage(`🔎 Pinterest پر "${query}" کے لیے ڈی پی تلاش کر رہا ہوں...`, event.threadID, event.messageID);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(response.data);
    const imageUrls = [];

    $('img[srcset]').each((i, el) => {
      const srcset = $(el).attr('srcset');
      const img = srcset.split(',').pop().split(' ')[0];
      if (img && (img.endsWith('.jpg') || img.endsWith('.png'))) {
        imageUrls.push(img);
      }
    });

    if (imageUrls.length === 0) {
      return api.sendMessage("⚠️ کوئی تصویر نہیں ملی۔", event.threadID, event.messageID);
    }

    const selectedImages = imageUrls.sort(() => 0.5 - Math.random()).slice(0, 6);
    const attachments = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const imgUrl = selectedImages[i];
      const imgPath = `${__dirname}/cache/dpz-${Date.now()}-${i}.jpg`;

      const imgData = (await axios.get(imgUrl, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(imgPath, Buffer.from(imgData, 'binary'));

      attachments.push(fs.createReadStream(imgPath).on("end", () => fs.unlinkSync(imgPath)));
    }

    api.sendMessage({
      body: `🖼️ "${query}" کے لیے Pinterest سے ڈی پی ملی ہیں۔`,
      attachment: attachments
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ کچھ غلط ہو گیا، براہ کرم دوبارہ کوشش کریں۔", event.threadID, event.messageID);
  }
};
