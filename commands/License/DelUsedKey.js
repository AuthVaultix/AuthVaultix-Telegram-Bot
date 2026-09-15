const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

let waitKey = {};

module.exports = {
    name: "delusedkey",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // Step 1  Ask License
        bot.sendMessage(chatId," Enter *used license key* to delete:",
        { parse_mode:"Markdown" });

        waitKey[chatId] = true;

        bot.once("message", async r1 => {

            if (!waitKey[chatId]) return;
            delete waitKey[chatId];

            const key = r1.text.trim();

            bot.sendMessage(chatId," Deleting used key...",{ parse_mode:"Markdown" });

            try {
                const url = `${BASE}/seller_delete_used.php?sellerkey=${SELLER}&type=delete_used&license=${encodeURIComponent(key)}`;
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," " + (res.data.msg || "Failed deleting used key."));

                if (!res.data.deleted.length)
                    return bot.sendMessage(chatId," No used license found for this key.");

                bot.sendMessage(chatId,
                    ` *Deleted Used License:*\n\`\`\`\n${res.data.deleted.join("\n")}\n\`\`\``,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
