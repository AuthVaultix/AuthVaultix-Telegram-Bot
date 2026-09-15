const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

let exportFlow = {};

module.exports = {
    name: "exportkeys",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // STEP 1  ask export format
        bot.sendMessage(
            chatId,
            " Choose export format:\nReply with `text` or `csv`",
            { parse_mode:"Markdown" }
        );

        exportFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!exportFlow[chatId]) return;

            let format = r1.text.trim().toLowerCase();
            if (!["text","csv"].includes(format))
                return bot.sendMessage(chatId," Invalid! Reply only `text` or `csv`");

            delete exportFlow[chatId];
            bot.sendMessage(chatId," Exporting keys...",{ parse_mode:"Markdown" });

            try {

                const url = `${BASE}/seller_export_keys.php?sellerkey=${SELLER}&format=${format}`;
                const res = await axios.get(url,{ responseType:"text" });

                let out = res.data.trim();
                if (!out)
                    return bot.sendMessage(chatId," No license keys found.");

                // Safe length for telegram output
                if (out.length > 3800)
                    out = out.slice(0,3800) + "\n... (truncated)";

                bot.sendMessage(
                    chatId,
                    ` *EXPORT (${format.toUpperCase()})*\n\`\`\`\n${out}\n\`\`\``,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," Export failed.");
            }
        });
    }
};
