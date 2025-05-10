module.exports = {
  config: {
    name: "groupstats",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "Show detailed group statistics",
    commandCategory: "Group",
    usages: "",
    cooldowns: 5,
  },

  run: async function ({ api, event, Threads, Users }) {
    try {
      const threadID = event.threadID;
      const userID = event.senderID;

      // Fetch full thread info
      const threadInfo = await api.getThreadInfo(threadID);
      const userInfo = await api.getUserInfo(userID);
      const threadData = await Threads.getData(threadID);
      const userData = await Users.getData(userID);

      const threadName = threadInfo.threadName || "Unnamed Group";
      const totalMembers = threadInfo.participantIDs.length;
      const adminCount = threadInfo.adminIDs.length;

      const userJoinTime = threadData?.memberJoinTime?.[userID]
        ? new Date(threadData.memberJoinTime[userID] * 1000).toLocaleString()
        : "Unknown";

      const totalMsg = threadData?.messageCount || "N/A";
      const userMsgCount = userData?.data?.msgCount?.[threadID] || 0;

      const message = `
📊 Group Stats:

👥 Group Name: ${threadName}
🆔 Thread ID: ${threadID}
👤 Members: ${totalMembers}
🛡️ Admins: ${adminCount}
💬 Total Messages: ${totalMsg}

📎 Your Stats:
🔹 Name: ${userInfo[userID].name}
🔹 Messages Sent: ${userMsgCount}
🔹 Joined: ${userJoinTime}
      `.trim();

      return api.sendMessage(message, threadID, event.messageID);
    } catch (err) {
      console.error("Error fetching group stats:", err);
      return api.sendMessage("❌ Failed to fetch group stats.", event.threadID, event.messageID);
    }
  },
};
