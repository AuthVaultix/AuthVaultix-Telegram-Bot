const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let flow = {}; // multi-step session removal flow

module.exports = {
    name: "endsession",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────────────────────
        // STEP 1  Ask for session_id
        // ─────────────────────────────────────────────
        bot.sendMessage(chatId," Enter *Session ID* to end:",{ parse_mode: "Markdown" });

        flow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!flow[chatId] || flow[chatId].step !== 1) return;

            const sessionID = r1.text.trim();
            flow[chatId] = { step: 2, sessionID };

            // ─────────────────────────────────────────────
            // STEP 2  Confirmation
            // ─────────────────────────────────────────────
            bot.sendMessage(
                chatId,
                ` Are you sure you want to *terminate this session*?\nSession ID: \`${sessionID}\`\n\nReply **yes** to confirm.`,
                { parse_mode: "Markdown" }
            );

            bot.once("message", async r2 => {
                if (!flow[chatId] || flow[chatId].step !== 2) return;

                const confirm = r2.text.trim().toLowerCase();
                const id = flow[chatId].sessionID;
                delete flow[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — Session not ended.");

                bot.sendMessage(chatId,` Ending session *${id}* ...`,
                { parse_mode: "Markdown" });

                // ─────────────────────────────────────────────
                // API CALL
                // ─────────────────────────────────────────────
                try {
                    const url = `${BASE}/sessions_end_single.php?sellerkey=${SELLER}&type=end_session&session_id=${encodeURIComponent(id)}`;
                    const r = await axios.get(url);

                    if (r.data?.success)
                        return bot.sendMessage(chatId,
                        ` **Session Ended Successfully**\n ID: \`${id}\``,
                        { parse_mode: "Markdown" });

                    return bot.sendMessage(chatId," " + (r.data?.message || "Failed"));

                } catch (e) {
                    console.log(e);
                    bot.sendMessage(chatId," API Request Failed.");
                }
            });
        });
    }
};
