const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitingForUser = {}; // temporary store for reply

module.exports = {
    name: "unbanuser",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // Step 1  Ask for username
        bot.sendMessage(chatId," Enter the *username* you want to unban:",
        { parse_mode:"Markdown" });

        // save chat state
        waitingForUser[chatId] = true;

        // Now wait for username reply
        bot.once("message", async response => {
            if (!waitingForUser[chatId]) return;

            const username = response.text.trim();
            delete waitingForUser[chatId]; // clear state

            bot.sendMessage(chatId,` Unbanning **${username}**...`);

            const url = `${BASE}/unban_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

            try {
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId,` ${res.data.msg}`);

                return bot.sendMessage(chatId,
` *User Unbanned Successfully*
 Username: \`${username}\``,
                { parse_mode:"Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed — Check console.");
            }
        });
    }
};
