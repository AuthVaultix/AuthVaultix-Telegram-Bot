const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let pending = {}; // track conversation step per-user

module.exports = {
    name: "revertuservar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ── STEP 1  Ask Username ───────────────────────────────
        bot.sendMessage(chatId, " Enter *username* to fetch all variables:",
        { parse_mode: "Markdown" });

        pending[chatId] = true;

        bot.once("message", async res => {

            if (!pending[chatId]) return;
            const username = res.text.trim();
            delete pending[chatId];

            bot.sendMessage(chatId, ` Retrieving variables for *${username}* ...`,
            { parse_mode: "Markdown" });

            // ── API CALL ─────────────────────────────────────────
            try {
                const url = `${BASE}/seller_retrieve_all_user_variables.php?sellerkey=${SELLER}&username=${username}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId, ` ${r.data.msg || "Failed"}`);

                const vars = r.data.variables;

                if (!vars.length)
                    return bot.sendMessage(chatId, ` No variables found for *${username}*`,
                        { parse_mode: "Markdown" }
                    );

                // ── Format Output ────────────────────────────────
                let text = ` *Variables for ${username}:*\n\n`;
                vars.forEach(v => {
                    text += ` *${v.variable_name}*\n Value: \`${v.variable_data}\`\n ${v.created_at}\n\n`;
                });

                return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId, " API failed — check server.");
            }
        });
    }
};
