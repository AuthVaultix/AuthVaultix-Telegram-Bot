const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

module.exports = {
    name: "managerlist",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Fetching manager accounts...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_manager_list.php?sellerkey=${SELLER}`;
            const r = await axios.get(url);

            if (!r.data.success)
                return bot.sendMessage(chatId," " + r.data.msg);

            const managers = r.data.managers;
            if (!managers.length)
                return bot.sendMessage(chatId," No managers found!");

            let text = ` *Manager Accounts:*\n\n`;

            managers.forEach((m, index) => {
                text += `**${index+1}. ${m.username}**\n Email: \`${m.email ?? "None"}\`\n Created: *${m.created_at}*\n\n`;
            });

            text += `— Total Managers: *${managers.length}*`;

            return bot.sendMessage(chatId, text, { parse_mode:"Markdown" });

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," API Request Failed");
        }
    }
};
