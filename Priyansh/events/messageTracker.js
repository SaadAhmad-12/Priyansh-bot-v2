module.exports = async function ({ api, event, Users, Threads }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  // Skip non-message events
  if (!event.body || !senderID || !threadID) return;

  // ========== Update user msgCount ==========
  let userData = await Users.getData(senderID);
  if (!userData.data.msgCount) userData.data.msgCount = {};

  if (!userData.data.msgCount[threadID]) {
    userData.data.msgCount[threadID] = 1;
  } else {
    userData.data.msgCount[threadID]++;
  }

  await Users.setData(senderID, userData);

  // ========== Update thread total message count ==========
  let threadData = await Threads.getData(threadID);
  if (!threadData.messageCount) threadData.messageCount = 0;

  threadData.messageCount++;
  await Threads.setData(threadID, threadData);
};
