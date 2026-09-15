const axios = require("axios");
require("dotenv").config();

let delUsedFlow = {};

module.exports = {
    name: "deleteallused",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = process.env.SELLERKEY;
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," `.env` में SELLERKEY missing है।");

        //  No input needed  direct confirmation
        bot.sendMessage(
            chatId,
            " Are you sure you want to delete **ALL used license keys**?\nReply **yes** to confirm.",
            { parse_mode:"Markdown" }
        );

        delUsedFlow[chatId] = true;

        bot.once("message", async r => {
            if (!delUsedFlow[chatId]) return;
            delete delUsedFlow[chatId];

            if (r.text.toLowerCase() !== "yes")
                return bot.sendMessage(chatId," Cancelled — No keys removed.");

            bot.sendMessage(chatId," Deleting used keys...",
            { parse_mode:"Markdown" });

            try {
                const url = `${BASE}/seller_delete_all_used.php?sellerkey=${SELLER}`;
                const res = await axios.get(url);

                if (typeof res.data === "object")
                    return bot.sendMessage(chatId,` **Deleted Used Keys:** *${res.data.deleted_used}*`,
                        { parse_mode:"Markdown" });

                bot.sendMessage(chatId," " + res.data);

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
