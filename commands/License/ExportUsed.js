const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "exportused",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Exporting used licenses...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_export_used.php?sellerkey=${SELLER}`;
            let res = await axios.get(url, { responseType:"text" });

            let out = res.data.trim();

            if (!out || out.includes("No used licenses"))
                return bot.sendMessage(chatId," No used licenses found.");

            // Telegram limit safe — truncate if too long
            if (out.length > 3800)
                out = out.substring(0,3800) + "\n... (truncated)\n";

            bot.sendMessage(
                chatId,
                ` *EXPORTED USED LICENSES*:\n\`\`\`\n${out}\n\`\`\``,
                { parse_mode:"Markdown" }
            );

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," Failed to export used keys (API Error).");
        }
    }
};
