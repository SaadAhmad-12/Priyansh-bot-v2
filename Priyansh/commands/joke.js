module.exports = {
  config: {
    name: "joke",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "Fetches a random joke in Roman Urdu",
    commandCategory: "Fun",
    usages: "joke",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    const jokes = [
      "Ek aadmi doctor ke paas gaya aur kaha, 'Doctor sahib, mujhe bhoolne ki bimari ho gayi hai.' Doctor ne kaha, 'Kab se?' Aadmi bola, 'Kab se kya?'",
      "Teacher: Agar tumhare paas 5 aam ho aur tumhare dost tumse 2 aam le lein to tumhare paas kitne aam bachenge? Student: Sir, mujhe aam nahi pasand.",
      "Agar tumhara dil thoda sa bhi toot jaye, toh ek kaam karo, humara number dial karna. Hum tumhe batayenge ki kaise tumhara dil phir se toot jayega.",
      "Ek aadmi ke paas aik achha phone tha, doosra banda usse poocha, 'Kahan se liya?' Pehla banda: 'Yaar, yeh toh eik bakra tha!'",
      "Aaj kal log bhi kitne ajeeb hain, khud ko self-made samajhte hain, lekin jab unka phone gir jata hai, toh sabse pehle ‘Allah ka shukr hai, phone toh bach gaya’ kehte hain."
    ];

    // Get a random joke
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    // Send the joke to the group
    return api.sendMessage(randomJoke, event.threadID);
  }
};
