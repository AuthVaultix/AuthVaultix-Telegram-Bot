const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

let subWait = {};

module.exports = {
    name: "delusedall",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // Ask subscription first
        bot.sendMessage(chatId," Enter *subscription name* to delete ALL used licenses:",
        { parse_mode:"Markdown" });

        subWait[chatId] = true;

        bot.once("message", async r1 => {

            if (!subWait[chatId]) return;
            delete subWait[chatId];

            const sub = r1.text.trim();

            bot.sendMessage(chatId," Removing all used keys...",{ parse_mode:"Markdown" });

            try {
                const url =
                    `${BASE}/seller_delete_used.php?sellerkey=${SELLER}` +
                    `&type=delete_used&subscription=${encodeURIComponent(sub)}` +
                    `&amount=999999`;

                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," " + (res.data.msg || "Failed deleting used keys."));

                if (!res.data.deleted.length)
                    return bot.sendMessage(chatId, ` No used licenses found for *${sub}*`);

                bot.sendMessage(
                    chatId,
                    ` *Deleted ALL Used Keys for:* **${sub}**\n\`\`\`\n${res.data.deleted.join("\n")}\n\`\`\``,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
