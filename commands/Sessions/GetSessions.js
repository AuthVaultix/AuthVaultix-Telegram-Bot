const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "getsessions",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        bot.sendMessage(chatId," Fetching active sessions...",{ parse_mode:"Markdown" });

        // ── API CALL ─────────────────────────────────────────
        try {
            const url = `${BASE}/sessions_get.php?sellerkey=${SELLER}&format=json`;
            const r = await axios.get(url);

            if (!r.data.success || !r.data.sessions)
                return bot.sendMessage(chatId," Failed to retrieve sessions.");

            const sessions = r.data.sessions;

            if (!sessions.length)
                return bot.sendMessage(chatId," No active sessions found.");

            // ── Format response ──────────────────────────────
            let text = " *Active Sessions:*\n\n";
            sessions.forEach(s => {
                text += ` *Session ID:* ${s.session_id}\n User: ${s.username}\n IP: ${s.ip_address}\n Created: ${s.created_at}\n Expire: ${s.expired_at}\n\n`;
            });

            return bot.sendMessage(chatId, text, { parse_mode:"Markdown" });

        } catch (err) {
            console.log(err);
            bot.sendMessage(chatId," API request failed.");
        }
    }
};
