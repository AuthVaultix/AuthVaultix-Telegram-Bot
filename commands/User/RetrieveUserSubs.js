const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "usersubs",

    async run(bot, msg) {


        const chatId    = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId, " Fetching subscriptions, please wait...");

        try {
            const res = await axios.get(`${BASE}/retrieve_user_subscriptions.php?sellerkey=${SELLER}`);

            if (!res.data.success)
                return bot.sendMessage(chatId, ` ${res.data.msg || "Failed to retrieve"}`);

            let list = res.data.subscriptions;
            if (!list.length)
                return bot.sendMessage(chatId, " No users found!");

            let output = ` *User Subscription List*  
─────────────────────  
 Total Users: *${list.length}*\n\n`;

            list.slice(0,30).forEach(u => {
                output += ` *${u.username}* — \`${u.subscription}\`\n`;
            });

            bot.sendMessage(chatId, output, { parse_mode: "Markdown" });

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId, " API Request Failed — Check server / BASE_URL");
        }
    }
};
