const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let subflow = {}; // step handler

module.exports = {
    name: "createsub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ───────────────────────────────────────────────
        // STEP 1  Ask Subscription Name
        // ───────────────────────────────────────────────
        bot.sendMessage(chatId," Enter subscription *name*:",
        { parse_mode:"Markdown" });

        subflow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!subflow[chatId] || subflow[chatId].step !== 1) return;

            subflow[chatId].name = r1.text.trim();
            subflow[chatId].step = 2;

            // ───────────────────────────────────────────────
            // STEP 2  Ask Level (Optional)
            // ───────────────────────────────────────────────
            bot.sendMessage(
                chatId,
                " Enter *subscription level* (send blank for level = 1):",
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!subflow[chatId] || subflow[chatId].step !== 2) return;

                const name  = subflow[chatId].name;
                const level = r2.text.trim() === "" ? 1 : Number(r2.text.trim());

                delete subflow[chatId];

                bot.sendMessage(chatId,` Creating subscription **${name}** ...`,
                { parse_mode:"Markdown" });

                // ───────────────────────────────────────────────
                // API CALL
                // ───────────────────────────────────────────────
                try {
                    const url =
                        `${BASE}/seller_create_subscription.php?sellerkey=${SELLER}` +
                        `&name=${encodeURIComponent(name)}` +
                        `&level=${encodeURIComponent(level)}`;

                    const r = await axios.get(url);

                    if (!r.data?.success)
                        return bot.sendMessage(chatId, " " + (r.data.message || "Failed to create subscription"));

                    return bot.sendMessage(
                        chatId,
                        ` **Subscription Created Successfully!**\n` +
                        ` Name: *${name}*\n Level: **${level}**`,
                        { parse_mode:"Markdown" }
                    );

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId," API Request Failed");
                }
            });
        });
    }
};
