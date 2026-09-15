const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "delexpired",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


        const url = `${BASE}/delete_expired_users.php?sellerkey=${SELLER}`;

        bot.sendMessage(chatId, " Removing expired users...");

        try {
            const res = await axios.get(url);

            if (!res.data.success)
                return bot.sendMessage(chatId, ` ${res.data.msg}`);

            return bot.sendMessage(chatId,
            ` *Expired Users Removed*
             Deleted: *${res.data.deleted} users*
            `, { parse_mode: "Markdown" });

        } catch (err) {
            console.error(err);
            return bot.sendMessage(chatId, " API Request Failed — Check console.");
        }
    }
};
