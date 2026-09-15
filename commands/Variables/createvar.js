const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let pending = {}; // multi-input sequence tracker

module.exports = {
    name: "addvar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ────────────────────────────────────────────────
        // STEP 1  ask for variable key
        // ────────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *variable key/name*:",{ parse_mode:"Markdown" });

        pending[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!pending[chatId] || pending[chatId].step !== 1) return;

            pending[chatId].key = r1.text.trim();
            pending[chatId].step = 2;

            // ────────────────────────────────────────────────
            // STEP 2  ask value/data
            // ────────────────────────────────────────────────
            bot.sendMessage(chatId," Enter *value* for this variable:",
            { parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!pending[chatId] || pending[chatId].step !== 2) return;

                const key = pending[chatId].key;
                const value = r2.text.trim();
                delete pending[chatId];

                bot.sendMessage(chatId,` Creating global variable *${key}*...`,
                { parse_mode:"Markdown" });

                // ────────────────────────────────────────────────
                // API CALL
                // ────────────────────────────────────────────────
                try {
                    const url = `${BASE}/seller_global_create.php?sellerkey=${SELLER}&key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId," " + res.data.msg);

                    return bot.sendMessage(
                        chatId,
                        ` **Global Variable Created**\n *${key}*\n Value: \`${value}\``,
                        { parse_mode:"Markdown" }
                    );

                } catch(e){
                    console.log(e);
                    bot.sendMessage(chatId," API Request Failed.");
                }
            });
        });
    }
};
