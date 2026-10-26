const axios = require("axios");
const { getSellerKey } = require("../../utils/db");

module.exports = {
    name: "changeusername",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();
        const SELLER = getSellerKey(chatId);

        if (!SELLER)
            return bot.sendMessage(chatId, "It appears you haven't set a Seller Key yet. \n\nTo set one, use the /setsellerkey command.");

        userState[chatId] = {
            step: 1,
            SELLER,
            handler: askOldUsername
        };

        bot.sendMessage(chatId, " Enter *old username*:", { parse_mode: "Markdown" });
    }
};

async function askOldUsername(msg, bot) {
    const chatId = msg.chat.id;
    userState[chatId].oldUser = msg.text.trim();
    userState[chatId].handler = askNewUsername;

    bot.sendMessage(chatId, " Enter *new username*:", { parse_mode: "Markdown" });
}

async function askNewUsername(msg, bot) {
    const chatId = msg.chat.id;
    const oldUser = userState[chatId].oldUser;
    const newUser = msg.text.trim();
    const SELLER = userState[chatId].SELLER;
    const BASE = process.env.BASE_URL;

    const url = `${BASE}?type=editusername&sellerkey=${SELLER}&old=${encodeURIComponent(oldUser)}&new=${encodeURIComponent(newUser)}`;

    try {
        const res = await axios.get(url);

        if (res.data.success) {
            bot.sendMessage(chatId,
` *Username Changed Successfully*
 Old: \`${oldUser}\`
 New: **${newUser}**`,
{ parse_mode: "Markdown" });
        } else {
            bot.sendMessage(chatId, ` ${res.data.msg || "Failed to update username"}`);
        }
    } catch {
        bot.sendMessage(chatId, " API Request Failed");
    }

    delete userState[chatId];
}
