const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitUnpause = {}; // store waiting state

module.exports = {
    name: "unpauseuser",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // Step 1  ask username
        bot.sendMessage(chatId,
` Send the *username* you want to UNPAUSE`,
{ parse_mode:"Markdown" });

        waitUnpause[chatId] = true;

        bot.once("message", async response => {
            if (!waitUnpause[chatId]) return;

            const username = response.text.trim();
            delete waitUnpause[chatId]; // clear pending request

            bot.sendMessage(chatId,` Unpausing **${username}**...`);

            const url = `${BASE}/unpause_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

            try {
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId,` ${res.data.msg}`);

                return bot.sendMessage(chatId,
` *User Unpaused Successfully*
 Username: \`${username}\`
`,{ parse_mode:"Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Failed — check console.");
            }
        });
    }
};
