const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let confirm = {}; 

module.exports = {
    name: "deleteallusers",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();

        //  REPLACED SELLERKEY - now decrypted from JSON
        const SELLER = getSellerKey(chatId);
        const BASE_URL = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        //  WARNING prompt
        bot.sendMessage(chatId,
` **WARNING: THIS WILL DELETE ALL USERS**
This cannot be undone!!

Type \`CONFIRM\` to proceed.`,
{ parse_mode:"Markdown" });

        confirm[chatId] = true;

        bot.once("message", async reply => {

            if (!confirm[chatId]) return;
            delete confirm[chatId];

            if (reply.text !== "CONFIRM")
                return bot.sendMessage(chatId," Operation Cancelled.");

            bot.sendMessage(chatId," Deleting all users...");

            const url = `${BASE_URL}/delete_all_users.php?sellerkey=${SELLER}`;

            try {
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId,` Failed: *${res.data.msg}*`,{ parse_mode:"Markdown" });

                bot.sendMessage(chatId,
` **All Users Deleted**
 Removed: *${res.data.deleted_users}*`,
{ parse_mode:"Markdown" });

            } catch {
                bot.sendMessage(chatId," API Request Failed.");
            }
        });
    }
};
