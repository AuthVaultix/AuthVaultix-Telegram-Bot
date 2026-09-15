const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "activecount",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId, " Checking active sessions...", { parse_mode: "Markdown" });

        try {
            const url = `${BASE}/session_count_active.php?sellerkey=${SELLER}`;
            const r = await axios.get(url);

            if (r.data?.success)
                return bot.sendMessage(chatId, ` *Active Sessions:* \`${r.data.active_sessions}\``,
                    { parse_mode: "Markdown" });

            return bot.sendMessage(chatId, " Unexpected response.");

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId, " API Request Failed.");
        }
    }
};
