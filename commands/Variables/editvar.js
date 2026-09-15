const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let editFlow = {}; // step tracking

module.exports = {
    name: "editvar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ───────────────────────────────────────────────
        // STEP 1  Ask Global Variable Name (Key)
        // ───────────────────────────────────────────────
        bot.sendMessage(chatId, " Enter *global variable key/name* to update:",
        { parse_mode: "Markdown" });

        editFlow[chatId] = { step: 1 };

        bot.once("message", async res1 => {
            if (!editFlow[chatId] || editFlow[chatId].step !== 1) return;

            editFlow[chatId].key = res1.text.trim();
            editFlow[chatId].step = 2;

            // ───────────────────────────────────────────────
            // STEP 2  Ask new value
            // ───────────────────────────────────────────────
            bot.sendMessage(chatId, " Enter new *value/data*:",
            { parse_mode: "Markdown" });

            bot.once("message", async res2 => {
                if (!editFlow[chatId] || editFlow[chatId].step !== 2) return;

                const key = editFlow[chatId].key;
                const value = res2.text.trim();
                delete editFlow[chatId];

                bot.sendMessage(chatId, ` Updating global variable *${key}*...`,
                { parse_mode: "Markdown" });

                // ───────────────────────────────────────────────
                // API CALL
                // ───────────────────────────────────────────────
                try {
                    const url = `${BASE}/seller_global_edit.php?sellerkey=${SELLER}&key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;
                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId, " " + r.data.msg);

                    return bot.sendMessage(
                        chatId,
                        ` **Global Variable Updated**\n ${key}\n New Value  \`${value}\``,
                        { parse_mode: "Markdown" }
                    );

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId," API Request Failed");
                }
            });
        });
    }
};
