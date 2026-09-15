const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let confirmAll = {}; // confirmation session tracker

module.exports = {
    name: "endallsessions",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ───────────────────────────────────────────────
        // STEP 1  ask confirmation
        // ───────────────────────────────────────────────
        bot.sendMessage(
            chatId,
            " Are you sure you want to *terminate ALL active sessions*?\nReply **yes** to confirm.",
            { parse_mode: "Markdown" }
        );

        confirmAll[chatId] = true;

        bot.once("message", async res => {
            if (!confirmAll[chatId]) return;
            delete confirmAll[chatId];

            const text = res.text.toLowerCase().trim();

            // Cancel if not yes
            if (text !== "yes")
                return bot.sendMessage(chatId," Cancelled — No sessions terminated.");

            bot.sendMessage(chatId," Ending **ALL sessions**...",{ parse_mode:"Markdown" });

            // ───────────────────────────────────────────────
            // API CALL
            // ───────────────────────────────────────────────
            try {
                const url = `${BASE}/sessions_end_all.php?sellerkey=${SELLER}&type=end_all`;
                const r = await axios.get(url);

                if (r.data?.success)
                    return bot.sendMessage(chatId," **All Sessions Terminated Successfully!**");

                return bot.sendMessage(chatId," " + (r.data?.message || "Failed to terminate sessions"));

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API request failed.");
            }
        });
    }
};
