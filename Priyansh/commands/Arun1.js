module.exports.config = {
	name: "Arun",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "SAAD AHMAD", 
	description: "no prefix",
	commandCategory: "No command marks needed",
	usages: "...",
	cooldowns: 100, 
};

module.exports.handleEvent = function({ api, event }) {
	const { threadID, messageID } = event;
	let react = event.body ? event.body.toLowerCase() : "";

	if (
		react.includes("owner") ||
		react.includes("bot ower") || 
		react.includes("bot owner")
	) {
		const msg = {
			body: `
╭━━━ 🌟 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 🌟 ━━━╮

👑 𝗡𝗮𝗺𝗲: 𝐒𝐀𝐀𝐃 𝐀𝐇𝐌𝐀𝐃
🌐 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸:
🔗 https://www.facebook.com/profile.php?id=100065142133753

🧠 𝗖𝗿𝗲𝗮𝘁𝗼𝗿 𝗼𝗳 𝗧𝗵𝗲 𝗕𝗼𝘁
⚙️ 𝗖𝗼𝗱𝗲 𝗪𝗶𝘇𝗮𝗿𝗱 | 𝗧𝗲𝗰𝗵 𝗠𝗮𝘀𝘁𝗲𝗿

💖 𝗠𝗮𝗱𝗲 𝘄𝗶𝘁𝗵 𝗣𝗮𝘀𝘀𝗶𝗼𝗻 & 𝗘𝗻𝗲𝗿𝗴𝘆

━━━━━━━━━━━━━━━━━━━━━━━
✨ 𝗧𝗵𝗮𝗻𝗸 𝗬𝗼𝘂 𝗙𝗼𝗿 𝗨𝘀𝗶𝗻𝗴 𝗢𝘂𝗿 𝗕𝗼𝘁 ✨
🔮 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗜𝗺𝗮𝗴𝗶𝗻𝗮𝘁𝗶𝗼𝗻
╰━━━━━━━━━━━━━━━━━━━━━━╯
`
		};

		api.sendMessage(msg, threadID, messageID);
		api.setMessageReaction("💬", messageID, () => {}, true);
	}
};

module.exports.run = function({ api, event }) {};
