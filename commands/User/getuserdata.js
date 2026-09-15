const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitingForUser = new Map(); // store pending replies

module.exports = {
    name: "userdata",

    async run(bot, msg) {


        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");



        // If already waiting, ignore new start
        if (waitingForUser.has(chatId))
            return bot.sendMessage(chatId, " Already waiting for username… reply now.");

        bot.sendMessage(chatId, " Enter username to fetch user details:");

        // Store step
        waitingForUser.set(chatId, {
            step: "USERNAME"
        });

        // Listen for next reply
        bot.once("message", async response => {

            if (!waitingForUser.has(chatId)) return;

            let state = waitingForUser.get(chatId);

            if (state.step === "USERNAME") {

                const username = response.text.trim();
                waitingForUser.delete(chatId); // Clear state

                bot.sendMessage(chatId, ` Fetching data for *${username}*...`, { parse_mode: "Markdown" });

                try {
                    const res = await axios.get(`${BASE}/retrieve_user_data.php?sellerkey=${SELLER}&username=${username}`);

                    if (!res.data.success)
                        return bot.sendMessage(chatId, ` ${res.data.msg}`);

                    const u = res.data.user;

                    bot.sendMessage(chatId,
`*USER DETAILS*  
━━━━━━━━━━━━━━━━
 Username: *${u.username}*
 Subscription: *${u.subscription || "None"}*
 Expiry: *${u.expiry ? u.expiry : "Lifetime"}*
 HWID: \`${u.hwid || "None"}\`
 IP: \`${u.ip_address || "Unknown"}\`

 Status:
• Banned: *${u.is_banned ? " Yes" : " No"}*
• Paused: *${u.is_paused ? " Yes" : " No"}*

 Created: *${u.created_at}*
 Last Login: *${u.last_login || "Never"}*
`, { parse_mode: "Markdown" });

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId, " API Request Failed — check console.");
                }
            }
        });
    }
};
