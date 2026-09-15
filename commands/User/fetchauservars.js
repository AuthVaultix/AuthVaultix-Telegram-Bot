const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitUser = {}; // step  username पूछना

module.exports = {
    name: "fetchauservars",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ── STEP 1  पूछो username ────────────────────────────
        bot.sendMessage(chatId, " Enter *username* to fetch variables:",
            { parse_mode: "Markdown" });

        waitUser[chatId] = true;

        bot.once("message", async res1 => {

            if (!waitUser[chatId]) return;
            const username = res1.text.trim();
            delete waitUser[chatId];

            bot.sendMessage(chatId, ` Fetching variables for *${username}*...`,
                { parse_mode: "Markdown" });

            // ── API CALL ─────────────────────────────────────────
            try {
                const url = `${BASE}/seller_retrieve_all_user_variables.php?sellerkey=${SELLER}&username=${username}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId, ` ${r.data.msg}`);

                const vars = r.data.variables;
                if (!vars.length)
                    return bot.sendMessage(chatId, ` No variables found for *${username}*`,
                        { parse_mode: "Markdown" });

                // ── Format Pretty Output ────────────────────────
                let text = ` *Variables of ${username}:*\n\n`;
                vars.forEach(v => {
                    text += ` *${v.variable_name}*\n Value: \`${v.variable_data}\`\n ${v.created_at}\n\n`;
                });

                return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });

            } catch (e) {
                console.log(e);
                bot.sendMessage(chatId, " API Failed — check server.");
            }
        });
    }
};
