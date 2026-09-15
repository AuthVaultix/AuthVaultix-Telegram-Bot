const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let delSubKeyFlow = {};

module.exports = {
    name: "delsubkeys",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        //  STEP 1  Ask subscription
        bot.sendMessage(chatId," Enter *subscription name*:",
        { parse_mode:"Markdown" });

        delSubKeyFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!delSubKeyFlow[chatId] || delSubKeyFlow[chatId].step !== 1) return;

            delSubKeyFlow[chatId].sub = r1.text.trim();
            delSubKeyFlow[chatId].step = 2;

            bot.sendMessage(chatId,
                " How many keys to delete?\nSend **0** to delete ALL keys.",
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!delSubKeyFlow[chatId] || delSubKeyFlow[chatId].step !== 2) return;

                const sub    = delSubKeyFlow[chatId].sub;
                const amount = r2.text.trim();
                delSubKeyFlow[chatId].step = 3;
                delSubKeyFlow[chatId].amount = amount;

                bot.sendMessage(
                    chatId,
                    ` Confirm delete **${amount == 0 ? "ALL" : amount} keys** of subscription *${sub}*?\nReply **yes** to proceed.`,
                    { parse_mode:"Markdown" }
                );

                bot.once("message", async r3 => {
                    if (!delSubKeyFlow[chatId] || delSubKeyFlow[chatId].step !== 3) return;

                    const confirm = r3.text.trim().toLowerCase();
                    const amount  = delSubKeyFlow[chatId].amount;
                    const sub     = delSubKeyFlow[chatId].sub;
                    delete delSubKeyFlow[chatId];

                    if (confirm !== "yes")
                        return bot.sendMessage(chatId," Cancelled — No keys deleted.");

                    bot.sendMessage(chatId," Deleting keys...",
                    { parse_mode:"Markdown" });

                    try {
                        const url = `${BASE}/seller_delete_license.php?sellerkey=${SELLER}&type=delete&subscription=${encodeURIComponent(sub)}&amount=${amount}`;
                        const res = await axios.get(url);

                        if (typeof res.data === "object" && !res.data.success)
                            return bot.sendMessage(chatId," " + res.data.msg);

                        if (!res.data.deleted || res.data.deleted.length === 0)
                            return bot.sendMessage(chatId," No keys deleted.");

                        return bot.sendMessage(
                            chatId,
                            ` **Deleted Keys for Subscription:** *${sub}*\n\`\`\`\n${res.data.deleted.join("\n")}\n\`\`\``,
                            { parse_mode:"Markdown" }
                        );

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId,"connection failed — please run the command again.");
                    }
                });
            });
        });
    }
};
