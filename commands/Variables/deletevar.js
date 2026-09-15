const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let delState = {}; // confirmation step tracker

module.exports = {
    name: "delvar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ───────────────────────────────────────────────
        // STEP 1  Ask variable key
        // ───────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *global variable name/key* to delete:",
        { parse_mode:"Markdown" });

        delState[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!delState[chatId] || delState[chatId].step !== 1) return;

            const key = r1.text.trim();
            delState[chatId] = { step: 2, key };

            // ───────────────────────────────────────────────
            // STEP 2  Confirm deletion
            // ───────────────────────────────────────────────
            bot.sendMessage(
                chatId,
                ` Delete global variable: *${key}*?\nReply **yes** to confirm.`,
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!delState[chatId] || delState[chatId].step !== 2) return;

                const confirm = r2.text.trim().toLowerCase();
                const variable = delState[chatId].key;
                delete delState[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — No variable removed.");

                bot.sendMessage(chatId,` Removing *${variable}* ...`,
                { parse_mode:"Markdown" });

                // ───────────────────────────────────────────────
                // API CALL
                // ───────────────────────────────────────────────
                try {
                    const url = `${BASE}/seller_global_delete.php?sellerkey=${SELLER}&key=${encodeURIComponent(variable)}`;
                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId," " + r.data.msg);

                    return bot.sendMessage(
                        chatId,
                        ` **Global Variable Deleted**\n ${variable}`,
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
