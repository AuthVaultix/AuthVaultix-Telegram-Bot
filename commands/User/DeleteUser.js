const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "deluser",

    async run(bot, msg, args) {
        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


        //  اذا لم يتم إعطاء username في الأمر — إسأل المستخدم
        if (!args[1]) {
            bot.sendMessage(chatId, " Enter **username to delete:**");

            // ⬇ Wait for next reply by same user only
            bot.once("message", async reply => {

                const username = reply.text?.trim();
                if (!username) return bot.sendMessage(chatId, " Invalid username.");

                bot.sendMessage(chatId, ` Deleting \`${username}\`...`, { parse_mode: "Markdown" });

                const url = `${BASE}/delete_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;

                try {
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId, ` ${res.data.msg}`);

                    bot.sendMessage(chatId,
` *User Deleted Successfully*
 Username  \`${username}\`
`, { parse_mode: "Markdown" });

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId, " API Request Failed — Check console.");
                }
            });
        }

        // If username given directly in command
        else {
            const username = args[1];

            const url = `${BASE}/delete_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}`;
            bot.sendMessage(chatId, ` Deleting \`${username}\`...`, { parse_mode: "Markdown" });

            try {
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId, ` ${res.data.msg}`);

                bot.sendMessage(chatId,
` *User Deleted Successfully*
 Username  \`${username}\`
`, { parse_mode: "Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId, " API Request Failed — Check console.");
            }
        }
    }
};
