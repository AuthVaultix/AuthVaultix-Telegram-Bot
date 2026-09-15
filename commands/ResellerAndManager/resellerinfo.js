const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let infoFlow = {};

module.exports = {
    name: "resellerinfo",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ──────────────────────────────
        // STEP 1  Ask Username
        // ──────────────────────────────
        bot.sendMessage(chatId," Enter reseller username:",
        { parse_mode:"Markdown" });

        infoFlow[chatId] = true;

        bot.once("message", async r1 => {
            if (!infoFlow[chatId]) return;
            delete infoFlow[chatId];

            const user = r1.text.trim();
            bot.sendMessage(chatId,` Fetching reseller *${user}* ...`,
            { parse_mode:"Markdown" });

            // ──────────────────────────────
            // API REQUEST
            // ──────────────────────────────
            try {
                const url = `${BASE}/seller_reseller_get.php?sellerkey=${SELLER}&username=${user}`;
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId," " + res.data.msg);

                const r = res.data.reseller;

                return bot.sendMessage(
                    chatId,
                    ` *Reseller Found*\n\n` +
                    ` Username: **${r.username}**\n` +
                    ` ID: **${r.id}**\n` +
                    ` Created: **${r.created_at}**`,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed");
            }
        });
    }
};
