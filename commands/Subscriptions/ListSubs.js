const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "listsubs",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Fetching all subscriptions...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_get_subscriptions.php?sellerkey=${SELLER}&format=json`;
            const r = await axios.get(url);

            if (!r.data.success)
                return bot.sendMessage(chatId," " + (r.data.message || "Failed to fetch subscriptions"));

            const subs = r.data.subscriptions;

            if (!subs.length)
                return bot.sendMessage(chatId," No subscriptions found.");

            let text = ` *Subscriptions List:*\n\n`;
            subs.forEach(s => {
                text += ` *${s.name}* — Level: **${s.level}** — Status: \`${s.status}\`\n`;
            });

            return bot.sendMessage(chatId, text, { parse_mode:"Markdown" });

        } catch(e){
            console.log(e);
            bot.sendMessage(chatId," API request failed.");
        }
    }
};
