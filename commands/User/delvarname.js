const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let wait = {};

module.exports = {
    name: "delvarname",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


        // ── Step 1  variable पूछो ─────────────────────────────
        bot.sendMessage(chatId, " Enter *variable name* to delete (case-sensitive):",
            { parse_mode: "Markdown" });

        wait[chatId] = true;

        bot.once("message", async res => {

            if (!wait[chatId]) return;
            const variable = res.text.trim();
            delete wait[chatId];

            bot.sendMessage(chatId, ` Deleting all variables named *${variable}*...`,
                { parse_mode: "Markdown" });

            // ── API CALL ─────────────────────────────────────────
            try {
                const url = `${BASE}/seller_delete_variables_by_name.php?sellerkey=${SELLER}&var=${variable}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId, ` ${r.data.msg || "Failed to delete"}`);

                return bot.sendMessage(chatId,
                    ` **All Variables Deleted**\n Variable: \`${variable}\`\n Deleted Count: **${r.data.deleted}**`,
                    { parse_mode: "Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId, " API Failed — check server.");
            }
        });
    }
};
