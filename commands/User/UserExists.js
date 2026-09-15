const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitUserCheck = {};  // Track chat asking for username

module.exports = {
    name: "userexists",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // STEP 1 — Ask username
        bot.sendMessage(chatId,
" *Enter username to check:*",
{ parse_mode:"Markdown" });

        waitUserCheck[chatId] = true;

        bot.once("message", async res => {

            if (!waitUserCheck[chatId]) return;
            delete waitUserCheck[chatId];

            const username = res.text.trim();
            bot.sendMessage(chatId, ` Checking **${username}**...`);

            const url = `${BASE}/user_exists.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

            try {
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId, ` ${r.data.msg}`);

                if (r.data.exists)
                    return bot.sendMessage(chatId,
                        ` *User Exists*\n \`${username}\``,
                        { parse_mode:"Markdown" }
                    );
                else
                    return bot.sendMessage(chatId,
                        ` *User Not Found*\n Username: \`${username}\``,
                        { parse_mode:"Markdown" }
                    );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId, " API Request Failed — Check console.");
            }
        });
    }
};
