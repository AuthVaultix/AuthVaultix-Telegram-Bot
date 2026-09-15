const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let pauseFlow = {}; // multi-step handler

module.exports = {
    name: "pausesub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ───────────────────────────────────────────────
        // STEP 1  Ask Subscription Name
        // ───────────────────────────────────────────────
        bot.sendMessage(chatId," Enter subscription name to pause:",
        { parse_mode:"Markdown" });

        pauseFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {

            if (!pauseFlow[chatId] || pauseFlow[chatId].step !== 1) return;

            const subName = r1.text.trim();
            delete pauseFlow[chatId];

            bot.sendMessage(chatId,` Pausing subscription *${subName}* ...`,
            { parse_mode:"Markdown" });

            // ───────────────────────────────────────────────
            // API CALL
            // ───────────────────────────────────────────────
            try {
                const url = `${BASE}/seller_pause_subscription.php?sellerkey=${SELLER}&subscription=${encodeURIComponent(subName)}`;
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," " + (res.data.message || "Failed to pause"));

                return bot.sendMessage(
                    chatId,
                    ` **Subscription Paused Successfully**\n Name: *${subName}*`,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed");
            }
        });
    }
};
