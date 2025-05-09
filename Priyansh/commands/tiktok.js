const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'tiktok',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Modified by ChatGPT',
    description: 'Download and send TikTok video without watermark',
    commandCategory: 'Media',
    usages: '[TikTok video link]',
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const tiktokUrl = args.join(' ');

    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
      return api.sendMessage(
        '❌ Please provide a valid TikTok video link.',
        event.threadID,
        event.messageID
      );
    }

    const processingMsg = await api.sendMessage(
      '⏳ Downloading TikTok video, please wait...',
      event.threadID,
      null,
      event.messageID
    );

    try {
      const apiUrl = `https://snapdown.app/api/tiktok?url=${encodeURIComponent(tiktokUrl)}`;
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.video_url;

      if (!videoUrl) {
        throw new Error('❌ Could not retrieve the download link.');
      }

      const filename = `tiktok_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, 'cache', filename);
      const writer = fs.createWriteStream(filePath);

      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage(
          {
            attachment: fs.createReadStream(filePath),
            body: '🎬 Here is your TikTok video!',
          },
          event.threadID,
          () => {
            fs.unlinkSync(filePath); // Clean up
            api.unsendMessage(processingMsg.messageID);
          },
          event.messageID
        );
      });

      writer.on('error', (err) => {
        fs.unlinkSync(filePath);
        throw new Error(`❌ Error downloading video: ${err.message}`);
      });
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
