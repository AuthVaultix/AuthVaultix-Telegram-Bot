const axios = require("axios");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "addhwid",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();

        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId, "It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ---------------- STEP 1 — ASK USERNAME ---------------- //
        userState[chatId] = {
            step: 1,
            SELLER,
            handler: askUsername
        };

        bot.sendMessage(chatId, " Enter the *username* to add HWID:", { parse_mode: "Markdown" });
    }
};

// ======================= STEP 2 — ASK HWID =======================
async function askUsername(msg, bot) {
    const chatId = msg.chat.id;

    userState[chatId].username = msg.text.trim();
    userState[chatId].handler = askHWID;

    bot.sendMessage(chatId, " Now enter the *HWID*:", { parse_mode: "Markdown" });
}

// ======================= STEP 3 — SEND API REQUEST =======================
async function askHWID(msg, bot) {
    const chatId   = msg.chat.id;
    const username = userState[chatId].username;
    const hwid     = msg.text.trim();

    const SELLER = userState[chatId].SELLER;
    const BASE   = process.env.BASE_URL;

    const url = `${BASE}/add_hwid.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}&hwid=${encodeURIComponent(hwid)}`;

    try {
        const res = await axios.get(url);

        if (res.data.success) {
            bot.sendMessage(chatId,
` *HWID Added Successfully!*
 User: \`${username}\`
 HWID: \`${hwid}\``,
{ parse_mode: "Markdown" });
        } else {
            bot.sendMessage(chatId, ` Error: ${res.data.msg}`);
        }

    } catch {
        bot.sendMessage(chatId, " API ERROR — Check server status!");
    }

    delete userState[chatId];
}
