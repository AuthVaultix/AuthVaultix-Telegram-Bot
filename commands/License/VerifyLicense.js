const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let verifyFlow = {};

module.exports = {
    name: "verifylicense",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ─────────────────────────────
        // STEP 1 — Ask License Key
        // ─────────────────────────────
        bot.sendMessage(chatId," Enter *license key* to verify:",
        { parse_mode:"Markdown" });

        verifyFlow[chatId] = true;

        bot.once("message", async r1 => {
            if (!verifyFlow[chatId]) return;
            delete verifyFlow[chatId];

            const key = r1.text.trim();

            bot.sendMessage(chatId," Checking license...",
            { parse_mode:"Markdown" });

            try {
                const url = `${BASE}/seller_verify_license.php?sellerkey=${SELLER}&license=${encodeURIComponent(key)}`;
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," License not found.");

                const info = res.data.license;

                const output =
                                ` *License Details*
                                \`\`\`
                                Key      : ${info.license_key}
                                Used     : ${info.used}
                                Note     : ${info.note || "None"}
                                Expiry   : ${info.expiry_human}
                                Created  : ${info.created_at}
                                \`\`\``;

                bot.sendMessage(chatId, output, { parse_mode:"Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
