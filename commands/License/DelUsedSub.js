const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let flow = {};

module.exports = {
    name: "delusedsub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // Step 1  subscription
        bot.sendMessage(chatId," Enter *subscription name*:",{ parse_mode:"Markdown" });
        flow[chatId] = { step:1 };

        bot.once("message", async r1 => {
            if (!flow[chatId] || flow[chatId].step !== 1) return;

            flow[chatId] = { step:2, sub: r1.text.trim() };

            // Step 2  amount
            bot.sendMessage(chatId," How many keys to delete?\n(Type number or `all`)",{ parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!flow[chatId] || flow[chatId].step !== 2) return;

                let amount = r2.text.trim().toLowerCase() === "all"
                    ? 0 : parseInt(r2.text.trim());

                if (isNaN(amount))
                    return bot.sendMessage(chatId," Invalid number. Use digits or `all`");

                const { sub } = flow[chatId];
                delete flow[chatId];

                bot.sendMessage(chatId," Deleting used keys...",{ parse_mode:"Markdown" });

                try {
                    const url =
                        `${BASE}/seller_delete_used.php?sellerkey=${SELLER}` +
                        `&type=delete_used&subscription=${encodeURIComponent(sub)}` +
                        `&amount=${amount}`;

                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId," " + (res.data.msg || "Failed deleting keys."));

                    if (!res.data.deleted.length)
                        return bot.sendMessage(chatId, ` No used keys found for *${sub}*`);

                    bot.sendMessage(
                        chatId,
                        ` *Deleted Used Keys  ${sub}:*\n\`\`\`\n${res.data.deleted.join("\n")}\n\`\`\``,
                        { parse_mode:"Markdown" }
                    );

                } catch(err) {
                    console.log(err);
                    bot.sendMessage(chatId," API request failed.");
                }
            });
        });
    }
};
