        const axios = require("axios");
        const fs = require("fs");
        const { getSellerKey } = require("../../utils/db");
        require("dotenv").config();

        let waitUser = {}; // track step

        module.exports = {
            name: "deletealluservars",

            async run(bot, msg) {

                const chatId = msg.chat.id;
                const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId," आपने Seller Key सेट नहीं की!\n /setsellerkey");


                // ── STEP 1  username पूछो ─────────────────────────────
                bot.sendMessage(chatId, " Enter *username* to delete all variables:", { parse_mode: "Markdown" });
                waitUser[chatId] = true;

                bot.once("message", async res1 => {

                    if (!waitUser[chatId]) return;
                    const username = res1.text.trim();
                    delete waitUser[chatId];

                    bot.sendMessage(chatId, ` Deleting variables for *${username}*...`, { parse_mode: "Markdown" });

                    // ── API ─────────────────────────────────────────────
                    try {
                        const url = `${BASE}/seller_delete_all_user_variables.php?sellerkey=${SELLER}&username=${username}`;
                        const res = await axios.get(url);

                        if (!res.data.success)
                            return bot.sendMessage(chatId, ` ${res.data.msg}`);

                        return bot.sendMessage(chatId,
                            ` *All Variables Removed Successfully*\n User: *${username}*\n Total Deleted: **${res.data.deleted}**`,
                            { parse_mode: "Markdown" });

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId, " API Request Failed — Check Server.");
                    }
                });
            }
        };
