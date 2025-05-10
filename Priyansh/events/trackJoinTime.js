module.exports = {
  config: {
    name: "trackJoinTime",
    eventType: ["log:subscribe"],
  },

  run: async function ({ event, Threads }) {
    const threadID = event.threadID;

    try {
      const addedUsers = event.logMessageData.addedParticipants;
      const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp

      // Get existing thread data or create default
      const threadData = await Threads.getData(threadID) || {};
      if (!threadData.memberJoinTime) threadData.memberJoinTime = {};

      // Set join time for each added user
      for (const user of addedUsers) {
        const userID = user.userFbId;
        if (!threadData.memberJoinTime[userID]) {
          threadData.memberJoinTime[userID] = timestamp;
        }
      }

      await Threads.setData(threadID, threadData);
    } catch (err) {
      console.error("Failed to track join time:", err);
    }
  },
};
