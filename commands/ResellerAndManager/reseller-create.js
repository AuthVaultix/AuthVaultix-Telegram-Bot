const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let resellerFlow = {}; // step handler

module.exports = {
    name: "resellercreate",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────────────────────
        // STEP 1  Ask username
        // ─────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *new reseller username*:",
        { parse_mode:"Markdown" });

        resellerFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!resellerFlow[chatId] || resellerFlow[chatId].step !== 1) return;

            resellerFlow[chatId].username = r1.text.trim();
            resellerFlow[chatId].step = 2;

            // ─────────────────────────────────────────────
            // STEP 2  Ask password
            // ─────────────────────────────────────────────
            bot.sendMessage(chatId," Enter *password* for this reseller:",{ parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!resellerFlow[chatId] || resellerFlow[chatId].step !== 2) return;

                const username = resellerFlow[chatId].username;
                const password = r2.text.trim();
                delete resellerFlow[chatId];

                bot.sendMessage(chatId,` Creating reseller *${username}* ...`,{ parse_mode:"Markdown" });

                // ─────────────────────────────────────────────
                // API CALL
                // ─────────────────────────────────────────────
                try {
                    const url = `${BASE}/seller_reseller_create.php?sellerkey=${SELLER}&username=${username}&password=${password}`;
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId," " + res.data.msg);

                    return bot.sendMessage(
                        chatId,
                        ` **Reseller Created Successfully!**\n Username: *${username}*\n Panel URL: \`${res.data.panel_url ?? "https://authsecure.shop/win/resaller/"}\``,
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
