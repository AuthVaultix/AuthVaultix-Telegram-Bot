const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let genKeyFlow = {}; // multi-step handler

module.exports = {
    name: "genkey",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ───────────────────────────────
        // STEP 1 — subscription name
        // ───────────────────────────────
        bot.sendMessage(chatId," Enter *subscription name*:",
        { parse_mode:"Markdown" });

        genKeyFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!genKeyFlow[chatId] || genKeyFlow[chatId].step !== 1) return;

            genKeyFlow[chatId].sub = r1.text.trim();
            genKeyFlow[chatId].step = 2;

            // ───────────────────────────────
            // STEP 2 — expiry days
            // ───────────────────────────────
            bot.sendMessage(chatId," Enter *expiry days*:",
            { parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!genKeyFlow[chatId] || genKeyFlow[chatId].step !== 2) return;

                genKeyFlow[chatId].expiry = r2.text.trim();
                genKeyFlow[chatId].step = 3;

                // ───────────────────────────────
                // STEP 3 — amount of keys
                // ───────────────────────────────
                bot.sendMessage(chatId," Enter *number of keys to generate:*",
                { parse_mode:"Markdown" });

                bot.once("message", async r3 => {
                    if (!genKeyFlow[chatId] || genKeyFlow[chatId].step !== 3) return;

                    const sub = genKeyFlow[chatId].sub;
                    const expiry = genKeyFlow[chatId].expiry;
                    const amount = r3.text.trim();

                    delete genKeyFlow[chatId];

                    bot.sendMessage(chatId," Generating keys...",
                    { parse_mode:"Markdown" });

                    // ───────────────────────────────
                    // API CALL
                    // ───────────────────────────────
                    try {
                        const url = `${BASE}/seller_create_license.php?sellerkey=${SELLER}&type=add&subscription=${sub}&expiry=${expiry}&amount=${amount}&mask=******-******-******&format=text`;
                        const res = await axios.get(url);

                        return bot.sendMessage(
                            chatId,
                            ` *Generated Keys:* \n\`\`\`\n${res.data}\n\`\`\``,
                            { parse_mode:"Markdown" }
                        );

                    } catch (e) {
                        console.log(e);
                        bot.sendMessage(chatId, " API Error — generation failed.");
                    }
                });
            });
        });
    }
};
