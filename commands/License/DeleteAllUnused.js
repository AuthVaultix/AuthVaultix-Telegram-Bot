const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "deleteallunused",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        bot.sendMessage(chatId," Deleting ALL unused licenses...",
        { parse_mode:"Markdown" });

        try {
            const url = `${BASE}/seller_delete_all_unused.php?sellerkey=${SELLER}`;
            const res = await axios.get(url);

            // Expected JSON result
            if (typeof res.data === "object")
                return bot.sendMessage(chatId,` *Unused Licenses Deleted:* **${res.data.deleted_unused}**`,
                { parse_mode:"Markdown" });

            // Text fallback
            bot.sendMessage(chatId," " + res.data);

        } catch(err) {
            console.log(err);
            bot.sendMessage(chatId,"connection failed — please run the command again.");
        }
    }
};
