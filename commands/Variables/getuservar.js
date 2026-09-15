const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let wait = {}; // step handler

module.exports = {
    name: "retrvvar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ─────────────────────────────────────────────
        // STEP 1  Ask Key Input
        // ─────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *global variable name/key*:",
        { parse_mode:"Markdown" });

        wait[chatId] = true;

        bot.once("message", async res => {
            if (!wait[chatId]) return;
            delete wait[chatId];

            const key = res.text.trim();
            bot.sendMessage(chatId,` Fetching variable value for *${key}*...`,
            { parse_mode:"Markdown" });

            try {

                const url = `${BASE}/seller_global_get.php?sellerkey=${SELLER}&key=${encodeURIComponent(key)}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId," " + r.data.msg);

                return bot.sendMessage(
                    chatId,
                    ` *Variable:* **${key}**\n Value: \`${r.data.variable.setting_value}\``,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
