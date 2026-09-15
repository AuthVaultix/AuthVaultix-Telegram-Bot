const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let chain = {}; // Track 3-step prompt flow

module.exports = {
    name: "setvar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ── STEP 1  ask username ─────────────────────────────
        chain[chatId] = { step: 1 };
        bot.sendMessage(chatId, " Enter *username* to set variable for:", { parse_mode: "Markdown" });

        bot.once("message", async res1 => {
            if (!chain[chatId] || chain[chatId].step !== 1) return;

            chain[chatId].user = res1.text.trim();
            chain[chatId].step = 2;

            // ── STEP 2  ask variable key ─────────────────────
            bot.sendMessage(chatId, " Enter *variable name*: ", { parse_mode: "Markdown" });

            bot.once("message", async res2 => {
                if (!chain[chatId] || chain[chatId].step !== 2) return;

                chain[chatId].key = res2.text.trim();
                chain[chatId].step = 3;

                // ── STEP 3  ask new value ─────────────────────
                bot.sendMessage(chatId, " Enter *value/data* to set:", { parse_mode: "Markdown" });

                bot.once("message", async res3 => {
                    if (!chain[chatId] || chain[chatId].step !== 3) return;

                    const value = res3.text.trim();
                    const { user, key } = chain[chatId];
                    delete chain[chatId];

                    bot.sendMessage(chatId, ` Setting variable *${key}* for *${user}*...`,
                    { parse_mode: "Markdown" });

                    // ── API CALL ─────────────────────────────────
                    try {
                        const url = `${BASE}/seller_set_user_variable.php?sellerkey=${SELLER}&username=${user}&var=${key}&newdata=${encodeURIComponent(value)}`;
                        const r = await axios.get(url);

                        if (!r.data.success)
                            return bot.sendMessage(chatId, ` ${r.data.msg}`);

                        return bot.sendMessage(chatId,
                            ` **Variable Saved/Updated**\n User: *${user}*\n Key: *${key}*\n Value: \`${value}\``,
                            { parse_mode: "Markdown" }
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
