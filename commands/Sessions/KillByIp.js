const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let step = {}; // multi-step confirmation flow

module.exports = {
    name: "killsessionsip",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ────────────────────────────────────────────────
        // STEP 1  Ask IP address
        // ────────────────────────────────────────────────
        bot.sendMessage(chatId, " Enter *IP address* to kill sessions:",
        { parse_mode: "Markdown" });

        step[chatId] = { stage: 1 };

        bot.once("message", async r1 => {
            if (!step[chatId] || step[chatId].stage !== 1) return;

            const ip = r1.text.trim();
            step[chatId] = { stage: 2, ip };

            // ────────────────────────────────────────────────
            // STEP 2  Ask confirmation
            // ────────────────────────────────────────────────
            bot.sendMessage(chatId,
                ` Are you sure you want to *terminate all sessions* from IP: **${ip}**?\nType **yes** to confirm.`,
                { parse_mode: "Markdown" }
            );

            bot.once("message", async r2 => {
                if (!step[chatId] || step[chatId].stage !== 2) return;

                const confirm = r2.text.toLowerCase().trim();
                const targetIP = step[chatId].ip;
                delete step[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId, " Cancelled — No sessions terminated.");

                bot.sendMessage(chatId, ` Terminating sessions for IP: *${targetIP}* ...`,
                { parse_mode: "Markdown" });

                // ────────────────────────────────────────────────
                // API CALL
                // ────────────────────────────────────────────────
                try {
                    const url = `${BASE}/session_kill_ip.php?sellerkey=${SELLER}&type=kill_ip&ip=${targetIP}`;
                    const res = await axios.get(url);

                    if (res.data?.success)
                        return bot.sendMessage(chatId,
                            ` **Sessions Terminated**\n IP: \`${targetIP}\``,
                            { parse_mode: "Markdown" }
                        );

                    return bot.sendMessage(chatId, ` Failed — ${res.data.message}`);

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId, " API request failed.");
                }
            });
        });
    }
};
