//som glitesh
const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "resellerlist",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Fetching reseller list...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_reseller_get_all.php?sellerkey=${SELLER}`;
            const r = await axios.get(url);

            if (!r.data.success)
                return bot.sendMessage(chatId," " + r.data.msg);

            const list = r.data.resellers;
            if (!list.length)
                return bot.sendMessage(chatId," No resellers found!");

            let text = ` *Total Resellers: ${list.length}*\n\n`;

            list.forEach((res, index) => {
                text += `\`${index+1}\` • **${res.username}** —  *${res.created_at}*\n`;
            });

            return bot.sendMessage(chatId, text, { parse_mode:"Markdown" });

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," API Request Failed");
        }
    }
};
