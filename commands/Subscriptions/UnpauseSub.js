const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let flow = {}; // step tracker

module.exports = {
    name: "unpausesub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ────────────────────────────────
        // STEP 1  Ask subscription name
        // ────────────────────────────────
        bot.sendMessage(chatId," Enter subscription name to unpause:",
        { parse_mode:"Markdown" });

        flow[chatId] = { step: 1 };

        bot.once("message", async res => {

            if (!flow[chatId] || flow[chatId].step !== 1) return;

            const subName = res.text.trim();
            delete flow[chatId];

            bot.sendMessage(chatId,` Unpausing *${subName}*...`,
            { parse_mode:"Markdown" });

            // ────────────────────────────────
            // API CALL
            // ────────────────────────────────
            try {
                const url = `${BASE}/seller_unpause_subscription.php?sellerkey=${SELLER}&subscription=${encodeURIComponent(subName)}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId," " + (r.data.message || "Failed to unpause."));

                return bot.sendMessage(
                    chatId,
                    ` **Subscription Unpaused Successfully**\n Name: *${subName}*`,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed");
            }
        });
    }
};
