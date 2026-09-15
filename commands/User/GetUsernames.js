const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "getusernames",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        bot.sendMessage(chatId, " Fetching usernames from server...");

        const url = `${BASE}/get_usernames.php?sellerkey=${SELLER}&format=text`;

        try {
            const res = await axios.get(url);

            if (!res.data || res.data.length < 1) {
                return bot.sendMessage(chatId, " No usernames found.");
            }

            let text = ` *All Usernames List*\n\n\`\`\`\n${res.data}\n\`\`\``;

            // Telegram Limit Protection — chunk if data is large
            if (text.length > 3900) {
                let parts = text.match(/[\s\S]{1,3900}/g);
                for (let part of parts) {
                    await bot.sendMessage(chatId, part, { parse_mode: "Markdown" });
                }
            } else {
                bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
            }

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId, " API connection failed — Check BASE_URL / Server");
        }
    }
};
