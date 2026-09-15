const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let subDeleteFlow = {}; // confirmation flow system

module.exports = {
    name: "delsub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────────────────────
        // STEP 1  Ask subscription name
        // ─────────────────────────────────────────────
        bot.sendMessage(chatId," Enter subscription *name* to delete:",
        { parse_mode:"Markdown" });

        subDeleteFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!subDeleteFlow[chatId] || subDeleteFlow[chatId].step !== 1) return;

            const name = r1.text.trim();
            subDeleteFlow[chatId] = { step: 2, name };

            // ─────────────────────────────────────────────
            // STEP 2  Confirmation
            // ─────────────────────────────────────────────
            bot.sendMessage(
                chatId,
                ` Delete subscription *${name}*?\nType **yes** to confirm.`,
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!subDeleteFlow[chatId] || subDeleteFlow[chatId].step !== 2) return;

                const confirm = r2.text.trim().toLowerCase();
                const target = subDeleteFlow[chatId].name;
                delete subDeleteFlow[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — Subscription not removed.");

                bot.sendMessage(chatId,` Removing subscription *${target}* ...`,
                { parse_mode:"Markdown" });

                // ─────────────────────────────────────────────
                // API CALL
                // ─────────────────────────────────────────────
                try {
                    const url =
                        `${BASE}/seller_delete_subscription.php?sellerkey=${SELLER}&name=${encodeURIComponent(target)}`;

                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId," " + (r.data.message || "Failed to delete subscription"));

                    return bot.sendMessage(
                        chatId,
                        ` **Subscription Deleted Successfully**\n Name: *${target}*`,
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
