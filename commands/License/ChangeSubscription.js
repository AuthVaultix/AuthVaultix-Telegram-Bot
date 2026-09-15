const axios = require("axios");
const fs = require("fs");

const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let changeSubFlow = {};

module.exports = {
    name: "changesub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ──────────────────────────────
        // STEP 1  Ask license key
        // ──────────────────────────────
        bot.sendMessage(chatId," Enter *license key*:",
        { parse_mode:"Markdown" });

        changeSubFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!changeSubFlow[chatId] || changeSubFlow[chatId].step !== 1) return;

            changeSubFlow[chatId].license = r1.text.trim();
            changeSubFlow[chatId].step = 2;

            bot.sendMessage(chatId," Enter *new subscription name*:",
            { parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!changeSubFlow[chatId] || changeSubFlow[chatId].step !== 2) return;

                const license = changeSubFlow[chatId].license;
                const subscription = r2.text.trim();
                delete changeSubFlow[chatId];

                bot.sendMessage(chatId," Updating subscription...",
                { parse_mode:"Markdown" });

                try {
                    const url = `${BASE}/seller_change_subscription.php?sellerkey=${SELLER}&key=${license}&subscription=${encodeURIComponent(subscription)}`;
                    const res = await axios.get(url);

                    if (typeof res.data === "object" && !res.data.success)
                        return bot.sendMessage(chatId," " + (res.data.msg || "Failed to update subscription"));

                    bot.sendMessage(
                        chatId,
                        ` **Subscription Updated Successfully**\n License: \`${license}\`\n Subscription: **${subscription}**`,
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
