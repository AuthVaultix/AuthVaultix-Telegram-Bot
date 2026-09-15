const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "pauseuser",

    async run(bot, msg, args) {
        const chatId = msg.chat.id.toString();

        //  Load & decrypt seller key
        const SELLER = getSellerKey(chatId);
        const BASE_URL = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");

        // ========= Mode 1  Username not provided ==========
        if (!args[1]) {
            bot.sendMessage(chatId," Enter username to pause:");

            bot.once("message", async reply => {
                const username = reply.text?.trim();
                if (!username) return bot.sendMessage(chatId," Invalid username.");

                const url = `${BASE_URL}/pause_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

                bot.sendMessage(chatId,` Pausing \`${username}\`...`,{ parse_mode:"Markdown" });

                try{
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId,` ${res.data.msg}`);

                    bot.sendMessage(chatId,
` *User Paused Successfully*
 Username  \`${username}\``,
{ parse_mode:"Markdown" });

                } catch {
                    bot.sendMessage(chatId," API Request Failed — check server");
                }
            });
        }

        // ========= Mode 2  Direct command `/pauseuser user` ==========
        else {
            const username = args[1];
            const url = `${BASE_URL}/pause_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

            bot.sendMessage(chatId,` Pausing \`${username}\`...`,{ parse_mode:"Markdown" });

            try{
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId,` ${res.data.msg}`);

                bot.sendMessage(chatId,
` *User Paused Successfully*
 Username  \`${username}\``,
{ parse_mode:"Markdown" });

            } catch {
                bot.sendMessage(chatId," API Request Failed");
            }
        }
    }
};
