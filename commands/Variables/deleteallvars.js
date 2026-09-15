const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let confirm = {}; // confirmation tracker

module.exports = {
    name: "delallvars",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ───────────────────────────────────────────────
        // STEP 1  Ask Dangerous Confirmation
        // ───────────────────────────────────────────────
        bot.sendMessage(
            chatId,
            " This will **DELETE ALL GLOBAL VARIABLES** permanently!\nReply **yes** to confirm.",
            { parse_mode:"Markdown" }
        );

        confirm[chatId] = true;

        bot.once("message", async r1 => {
            if (!confirm[chatId]) return;
            delete confirm[chatId];

            const text = r1.text.toLowerCase().trim();
            if (text !== "yes")
                return bot.sendMessage(chatId," Cancelled — No changes made.");

            bot.sendMessage(chatId," Removing *ALL global variables* ...",{ parse_mode:"Markdown" });

            // ───────────────────────────────────────────────
            // API CALL
            // ───────────────────────────────────────────────
            try {
                const url = `${BASE}/seller_global_delete_all.php?sellerkey=${SELLER}`;
                const r = await axios.get(url);

                if (!r.data.success)
                    return bot.sendMessage(chatId," " + r.data.msg);

                return bot.sendMessage(
                    chatId,
                    ` **Deleted ${r.data.deleted_count} global variables**`,
                    { parse_mode:"Markdown" }
                );

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed");
            }
        });
    }
};
