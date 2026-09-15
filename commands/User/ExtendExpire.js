const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let session = {};  // step handler

module.exports = {
    name: "extenduserexpiry",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // ────────────────────────────────────────────────
        // STEP 1  Ask Username
        // ────────────────────────────────────────────────
        bot.sendMessage(chatId, " Enter *username* to extend expiry:", { parse_mode: "Markdown" });

        session[chatId] = { step: 1 };

        bot.once("message", async res1 => {
            if (!session[chatId] || session[chatId].step !== 1) return;

            session[chatId].user = res1.text.trim();
            session[chatId].step = 2;

            // ────────────────────────────────────────────────
            // STEP 2  Ask Days
            // ────────────────────────────────────────────────
            bot.sendMessage(chatId, " Enter number of *days* to extend:", { parse_mode: "Markdown" });

            bot.once("message", async res2 => {
                if (!session[chatId] || session[chatId].step !== 2) return;

                const days = res2.text.trim();
                const user = session[chatId].user;
                delete session[chatId];

                bot.sendMessage(chatId, ` Extending expiry of *${user}* by **${days} Days**...`,
                    { parse_mode: "Markdown" }
                );

                // ────────────────────────────────────────────────
                // API CALL
                // ────────────────────────────────────────────────
                try {
                    const url = `${BASE}/extend_user_expiry.php?sellerkey=${SELLER}&username=${user}&days=${days}`;
                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId, ` ${r.data.msg}`);

                    return bot.sendMessage(chatId,
                        ` **Expiry Extended Successfully!**\n User: *${user}*\n Added Days: **${days}**`,
                        { parse_mode: "Markdown" }
                    );

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId, " API Request Failed");
                }
            });
        });
    }
};
