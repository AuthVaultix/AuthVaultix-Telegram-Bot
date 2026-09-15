const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "fetchallvars",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        bot.sendMessage(chatId, " Fetching global variables...", { parse_mode: "Markdown" });

        try {
            const url = `${BASE}/seller_global_get_all.php?sellerkey=${SELLER}`;
            const r = await axios.get(url);

            if (!r.data.success)
                return bot.sendMessage(chatId, " " + r.data.msg);

            const vars = r.data.variables;

            if (!vars.length)
                return bot.sendMessage(chatId, " No global variables found.");

            let text = ` *Global Variables:*\n\n`;
            vars.forEach(v => {
                text += ` *${v.setting_key}*  \`${v.setting_value}\`\n`;
            });

            return bot.sendMessage(chatId, text, { parse_mode:"Markdown" });

        } catch (e) {
            console.log(e);
            bot.sendMessage(chatId, " API request failed.");
        }
    }
};
