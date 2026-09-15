const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "usedkeys",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Fetching used keys...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_used_keys.php?sellerkey=${SELLER}`;
            const res = await axios.get(url);

            if (!res.data.success)
                return bot.sendMessage(chatId," Failed to fetch used keys.");

            const keys = res.data.used_keys;
            if (!keys.length)
                return bot.sendMessage(chatId," No used keys found.");

            let out = "";
            keys.forEach(k => {
                out += `${k.license_key}  UsedAt: ${k.used_at}  Note: ${k.note || "None"}\n`;
            });

            bot.sendMessage(
                chatId,
                ` *Used License Keys*\n\`\`\`\n${out}\n\`\`\``,
                { parse_mode:"Markdown" }
            );

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," API request failed.");
        }
    }
};
