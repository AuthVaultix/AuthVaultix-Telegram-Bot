const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let flow = {}; // track steps per chat

module.exports = {
    name: "edituservar",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


        // ── STEP 1  username ─────────────────────────
        bot.sendMessage(chatId, " Enter *username* to edit variable:", { parse_mode: "Markdown" });

        flow[chatId] = { step: 1 };

        bot.once("message", async res1 => {

            if (!flow[chatId] || flow[chatId].step !== 1) return;

            const username = res1.text.trim();
            flow[chatId].username = username;
            flow[chatId].step = 2;

            // ── STEP 2  variable name ─────────────────
            bot.sendMessage(chatId, " Enter *variable name*:",
                { parse_mode: "Markdown" });

            bot.once("message", async res2 => {

                if (!flow[chatId] || flow[chatId].step !== 2) return;

                const variable = res2.text.trim();
                flow[chatId].variable = variable;
                flow[chatId].step = 3;

                // ── STEP 3  new data ───────────────────
                bot.sendMessage(chatId, " Enter *new value* to update:",
                    { parse_mode: "Markdown" });

                bot.once("message", async res3 => {

                    if (!flow[chatId] || flow[chatId].step !== 3) return;

                    const newdata = res3.text.trim();
                    const { username, variable } = flow[chatId];

                    delete flow[chatId]; // cleanup

                    bot.sendMessage(chatId,
                        ` Updating *${variable}* for *${username}*...`,
                        { parse_mode: "Markdown" }
                    );

                    // ── API CALL ───────────────────────────
                    try {
                        const url = `${BASE}/seller_edit_user_variable.php?sellerkey=${SELLER}&username=${username}&var=${variable}&newdata=${encodeURIComponent(newdata)}`;
                        const r = await axios.get(url);

                        if (!r.data.success)
                            return bot.sendMessage(chatId, ` ${r.data.msg}`);

                        return bot.sendMessage(chatId,
                            ` **Updated Successfully!**\n User: *${username}*\n Var: \`${variable}\`\n New Value  \`${newdata}\``,
                            { parse_mode: "Markdown" }
                        );

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId," API Error — check server.");
                    }
                });
            });
        });
    }
};
