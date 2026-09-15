const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let step = {}; // {chatId: {stage, username}}

module.exports = {
    name: "deluservar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


        // ── STEP 1  username पूछो ─────────────────────────────
        bot.sendMessage(chatId, " Enter *username*:", { parse_mode: "Markdown" });

        step[chatId] = { stage: 1 };

        bot.once("message", async res1 => {

            if (!step[chatId] || step[chatId].stage !== 1) return;

            const username = res1.text.trim();
            step[chatId].username = username;
            step[chatId].stage = 2;

            // ── STEP 2  variable name पूछो ─────────────────────
            bot.sendMessage(chatId, " Enter *variable name* to delete:",
                { parse_mode: "Markdown" });

            bot.once("message", async res2 => {

                if (!step[chatId] || step[chatId].stage !== 2) return;

                const variable = res2.text.trim();
                delete step[chatId];

                bot.sendMessage(chatId,
                    ` Deleting variable *${variable}* from *${username}*...`,
                    { parse_mode: "Markdown" }
                );

                // ── API CALL ─────────────────────────────────────
                try {
                    const url = `${BASE}/seller_delete_user_variable.php?sellerkey=${SELLER}&username=${username}&var=${variable}`;
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId, ` ${res.data.msg}`);

                    return bot.sendMessage(chatId,
                        ` **Variable Deleted Successfully**\n User: *${username}*\n Variable: \`${variable}\``,
                        { parse_mode: "Markdown" }
                    );

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId, " API Request Failed — Check Server.");
                }
            });
        });
    }
};
