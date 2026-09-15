const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let licInfoFlow = {};

module.exports = {
    name: "licenseinfo",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────
        // STEP 1  Ask License Key
        // ─────────────────────────────
        bot.sendMessage(chatId," Enter *license key* to fetch full info:",
        { parse_mode:"Markdown" });

        licInfoFlow[chatId] = true;

        bot.once("message", async r1 => {
            if (!licInfoFlow[chatId]) return;
            delete licInfoFlow[chatId];

            const key = r1.text.trim();
            bot.sendMessage(chatId," Fetching license info...",
            { parse_mode:"Markdown" });

            try {
                const url = `${BASE}/seller_license_info.php?sellerkey=${SELLER}&key=${encodeURIComponent(key)}`;
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," " + (res.data.msg || "License not found"));

                const d = res.data.info;

                const formatted =
` *License Info*
\`\`\`
Key:       ${d.license_key}
Used:      ${d.used}
Used At:   ${d.used_at || "Never"}
Note:      ${d.note || "None"}
Created:   ${d.created_at}
Expiry:    ${d.expiry ? new Date(d.expiry*1000).toLocaleString() : "Never"}
\`\`\``;

                bot.sendMessage(chatId, formatted,{ parse_mode:"Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
