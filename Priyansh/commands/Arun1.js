const fs = require("fs");

module.exports.config = {
	name: "Arun",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Arun", 
	description: "no prefix",
	commandCategory: "No command marks needed",
	usages: "...",
	cooldowns: 100, 
};

module.exports.handleEvent = function({ api, event }) {
	const { threadID, messageID } = event;
	let react = event.body.toLowerCase();

	if (
		react.includes("owner") ||
		react.includes("bot ower") || 
		react.includes("bot owner")
	) {
		const msg = {
			body: `
╭━━━━━━━━━━━🔮━━━━━━━━━━━╮
   👑 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
╰━━━━━━━━━━━✨━━━━━━━━━━━╯

🧠 𝗡𝗔𝗠𝗘: 𝙎𝘼𝘼𝘿 𝘼𝙃𝙈𝘼𝘿
🎨 𝗧𝗜𝗧𝗟𝗘: 𝑪𝒓𝒆𝒂𝒕𝒐𝒓 ✦ 𝘾𝙤𝙙𝙚 𝙒𝙞𝙯𝙖𝙧𝙙 ⚡

🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞:
🔗 https://www.facebook.com/profile.php?id=100065142133753

📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘: 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑵𝒆𝒐𝒏 𝑴𝒊𝒏𝒅𝒔 💡

🛠️ 𝗠𝗔𝗗𝗘 𝗪𝗜𝗧𝗛 𝗟𝗢𝗩𝗘 & 𝗔𝗥𝗧
💖 𝑴𝒂𝒔𝒕𝒆𝒓𝒑𝒊𝒆𝒄𝒆 𝒐𝒇 𝑻𝒆𝒄𝒉 + 𝑷𝒂𝒔𝒔𝒊𝒐𝒏

━━━━━━━━━━━━━━━━━━━━━━━
🌟 𝗧𝗛𝗔𝗡𝗞 𝗬𝗢𝗨 𝗙𝗢𝗥 𝗨𝗦𝗜𝗡𝗚 𝗢𝗨𝗥 𝗕𝗢𝗧!
🔮 𝑬𝒏𝒕𝒆𝒓 𝑻𝒉𝒆 𝑭𝒖𝒕𝒖𝒓𝒆, 𝑵𝒐𝒘. ✨
━━━━━━━━━━━━━━━━━━━━━━━
`,
			attachment: fs.createReadStream(__dirname + `/noprefix/https://i.postimg.cc/qvFxjpDT/1746732265902.jpg`)
		};

		api.sendMessage(msg, threadID, messageID);
		api.setMessageReaction("👑", messageID, () => {}, true);
	}
};

module.exports.run = function({ api, event }) {};
