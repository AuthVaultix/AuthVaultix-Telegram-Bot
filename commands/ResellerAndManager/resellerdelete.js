const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let delReseller = {}; // confirmation flow handler

module.exports = {
    name: "resellerdelete",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ───────────────────────────────
        // STEP 1  Ask username
        // ───────────────────────────────
        bot.sendMessage(chatId," Enter reseller username to delete:",
        { parse_mode:"Markdown" });

        delReseller[chatId] = { step: 1 };

        bot.once("message", async u1 => {
            if (!delReseller[chatId] || delReseller[chatId].step !== 1) return;

            const user = u1.text.trim();
            delReseller[chatId] = { step: 2, user };

            // ───────────────────────────────
            // STEP 2  Confirm deletion
            // ───────────────────────────────
            bot.sendMessage(
                chatId,
                ` Delete reseller **${user}**?\nReply **yes** to confirm.`,
                { parse_mode:"Markdown" }
            );

            bot.once("message", async u2 => {
                if (!delReseller[chatId] || delReseller[chatId].step !== 2) return;

                const confirm = u2.text.trim().toLowerCase();
                const target = delReseller[chatId].user;
                delete delReseller[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — No reseller deleted.");

                bot.sendMessage(chatId,` Deleting reseller *${target}*...`,
                { parse_mode:"Markdown" });

                // ───────────────────────────────
                // API CALL
                // ───────────────────────────────
                try {
                    const url = `${BASE}/seller_reseller_delete.php?sellerkey=${SELLER}&username=${target}`;
                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId," " + r.data.msg);

                    return bot.sendMessage(
                        chatId,
                        ` **Reseller Deleted Successfully**\n Username: *${target}*`,
                        { parse_mode:"Markdown" }
                    );

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId," API request failed.");
                }
            });
        });
    }
};
