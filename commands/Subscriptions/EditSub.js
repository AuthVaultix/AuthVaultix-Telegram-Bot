const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let subEditor = {}; // flow tracker

module.exports = {
    name: "editsub",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ────────────────────────────────────────────────
        // STEP 1  Ask Old Subscription Name
        // ────────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *OLD subscription name*:",{ parse_mode:"Markdown" });

        subEditor[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!subEditor[chatId] || subEditor[chatId].step !== 1) return;

            subEditor[chatId].old = r1.text.trim();
            subEditor[chatId].step = 2;

            // ────────────────────────────────────────────────
            // STEP 2  Ask New Name
            // ────────────────────────────────────────────────
            bot.sendMessage(chatId," Enter *NEW name* for subscription:",
            { parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!subEditor[chatId] || subEditor[chatId].step !== 2) return;

                subEditor[chatId].new = r2.text.trim();
                subEditor[chatId].step = 3;

                // ────────────────────────────────────────────────
                // STEP 3  Ask New Level
                // ────────────────────────────────────────────────
                bot.sendMessage(chatId," Enter *new level* (number):",
                { parse_mode:"Markdown" });

                bot.once("message", async r3 => {
                    if (!subEditor[chatId] || subEditor[chatId].step !== 3) return;

                    const oldName = subEditor[chatId].old;
                    const newName = subEditor[chatId].new;
                    const level   = Number(r3.text.trim());

                    delete subEditor[chatId];

                    bot.sendMessage(chatId,
                        ` Updating **${oldName}**  **${newName}** (Level: ${level})...`,
                        { parse_mode:"Markdown" }
                    );

                    // ────────── API REQUEST ──────────
                    try {
                        const url =
                            `${BASE}/seller_edit_subscription.php?sellerkey=${SELLER}` +
                            `&old=${encodeURIComponent(oldName)}` +
                            `&new=${encodeURIComponent(newName)}` +
                            `&level=${level}`;

                        const r = await axios.get(url);

                        if (!r.data.success)
                            return bot.sendMessage(chatId," " + r.data.message);

                        return bot.sendMessage(
                            chatId,
                            ` **Subscription Updated Successfully**\n` +
                            ` Old Name: *${oldName}*\n New Name: *${newName}*\n Level: **${level}**`,
                            { parse_mode:"Markdown" }
                        );

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId," API Request Failed");
                    }
                });
            });
        });
    }
};
