const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let resellerEdit = {};

module.exports = {
    name: "reselleredit",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the /setsellerkey command.");

        // STEP 1 — Ask old username
        bot.sendMessage(chatId,"Enter current *reseller username*:",{ parse_mode:"Markdown" });

        resellerEdit[chatId] = { step: 1 };

        bot.once("message", async u1 => {
            if (!resellerEdit[chatId] || resellerEdit[chatId].step !== 1) return;

            resellerEdit[chatId].old = u1.text.trim();
            resellerEdit[chatId].step = 2;

            // STEP 2 — Ask new username
            bot.sendMessage(chatId,"Enter *new username*:",{ parse_mode:"Markdown" });

            bot.once("message", async u2 => {
                if (!resellerEdit[chatId] || resellerEdit[chatId].step !== 2) return;

                resellerEdit[chatId].new = u2.text.trim();
                resellerEdit[chatId].step = 3;

                // STEP 3 — Ask new password (optional)
                bot.sendMessage(chatId,"Enter *new password* (or send blank to keep same):",
                { parse_mode:"Markdown" });

                bot.once("message", async u3 => {
                    if (!resellerEdit[chatId] || resellerEdit[chatId].step !== 3) return;

                    const oldUser = resellerEdit[chatId].old;
                    const newUser = resellerEdit[chatId].new;
                    const newPass = u3.text.trim() || ""; // blank allowed

                    delete resellerEdit[chatId];

                    bot.sendMessage(chatId,
                        `Updating *${oldUser} -> ${newUser}* ...`,
                        { parse_mode:"Markdown" }
                    );

                    // API CALL
                    try {
                        const url = `${BASE}/seller_reseller_edit.php?sellerkey=${SELLER}&username=${oldUser}&new_username=${newUser}&new_password=${newPass}`;
                        const r = await axios.get(url);

                        if (!r.data.success)
                            return bot.sendMessage(chatId,"Error: " + r.data.msg);

                        return bot.sendMessage(
                            chatId,
                            `*Reseller Updated Successfully*\n` +
                            `Old: *${oldUser}*\nNew: *${newUser}*\nPassword Changed: **${r.data.updated.password_changed ? "YES" : "NO"}**`,
                            { parse_mode:"Markdown" }
                        );

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId,"API Request Failed");
                    }
                });
            });
        });
    }
};
