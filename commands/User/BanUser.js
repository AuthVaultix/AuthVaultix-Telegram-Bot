const axios = require("axios");
const { getSellerKey } = require("../../utils/db");
const fs = require("fs");
require("dotenv").config();



module.exports = {
    name: "banuser",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();

        // Load JSON seller keys
        const SELLER = getSellerKey(chatId);  //  KEY NOW DECRYPTED
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ---------------- Step 1 — Ask Username ----------------
        userState[chatId] = {
            step: 1,
            SELLER, //  store user's seller key for later use
            handler: askUsername
        };

        bot.sendMessage(chatId, " Enter the *username* to ban:", { parse_mode: "Markdown" });
    }
};

// ---------------- Step 2 — Ask Reason ----------------
async function askUsername(msg, bot) {
    const chatId = msg.chat.id;

    userState[chatId].username = msg.text.trim();
    userState[chatId].step = 2;
    userState[chatId].handler = askReason;

    bot.sendMessage(chatId, " Enter ban *reason* (or type `none`)", { parse_mode: "Markdown" });
}

// ---------------- Step 3 — Send API request ----------------
async function askReason(msg, bot) {
    const chatId = msg.chat.id;
    const username = userState[chatId].username;
    const reason   = msg.text.trim() === "none" ? "No reason" : msg.text.trim();

    const SELLER = userState[chatId].SELLER; //  key safe stored from earlier
    const BASE   = process.env.BASE_URL;

    const url =
        `${BASE}/ban_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}&reason=${encodeURIComponent(reason)}`;

    try {
        const res = await axios.get(url);

        if (res.data.success) {
            bot.sendMessage(chatId,
` *User Banned Successfully*
 User: \`${username}\`
 Reason: *${reason}*`,
{ parse_mode:"Markdown" });
        } else {
            bot.sendMessage(chatId, ` Error: ${res.data.msg}`);
        }

    } catch {
        bot.sendMessage(chatId, " API Error — check console.");
    }

    delete userState[chatId]; // reset chat flow
}
