const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "exportunused",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Exporting unused licenses...",
        { parse_mode: "Markdown" });

        try {
            const url = `${BASE}/seller_export_unused.php?sellerkey=${SELLER}`;
            let res = await axios.get(url, { responseType:"text" });

            let out = res.data.trim();

            if (!out || out.includes("No unused licenses"))
                return bot.sendMessage(chatId," No unused licenses found.");

            // Safe output limit — avoid flood
            if (out.length > 3800)
                out = out.slice(0,3800) + "\n... (truncated)";

            bot.sendMessage(
                chatId,
                ` *EXPORTED UNUSED LICENSES:*\n\`\`\`\n${out}\n\`\`\``,
                { parse_mode:"Markdown" }
            );

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," Failed to export unused keys (API Error).");
        }
    }
};
