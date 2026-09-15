const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
module.exports = {
    name: "getusers", // /getusers
    run: async (bot, msg, args) => {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        const url = `${BASE}/retrieve_users.php?sellerkey=${SELLER}`;

        bot.sendMessage(chatId, " Fetching users...");

        try {
            const res = await axios.get(url);

            if (!res.data.success)
                return bot.sendMessage(chatId, " " + res.data.msg);

            const users = res.data.users;

            if (!users.length)
                return bot.sendMessage(chatId, " No Users Found.");

            let list = users
                .slice(0, 50) // to avoid spam
                .map((u, i) =>
                    `${i + 1})  *${u.username}*\n` +
                    `┗ Subscription: *${u.subscription}*\n` +
                    `┗ Expiry: *${u.expiry}*\n` +
                    `┗ Paused: *${u.is_paused ? "Yes" : "No"}*\n`
                ).join("\n");

            return bot.sendMessage(chatId,
                ` *User List (showing 50 max)*\n\n${list}\n\nTotal: *${users.length}*`,
                { parse_mode: "Markdown" }
            );

        } catch (err) {
            console.log(err);
            return bot.sendMessage(chatId, " API Request Failed.");
        }
    }
};
