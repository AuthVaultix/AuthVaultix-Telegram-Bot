const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

let managerDelete = {}; // confirmation tracker

module.exports = {
    name: "managerdelete",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────────────────────
        // STEP 1  Ask username
        // ─────────────────────────────────────────────
        bot.sendMessage(chatId," Enter manager username to delete:",
        { parse_mode:"Markdown" });

        managerDelete[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!managerDelete[chatId] || managerDelete[chatId].step !== 1) return;

            const user = r1.text.trim();
            managerDelete[chatId] = { step: 2, user };

            // ─────────────────────────────────────────────
            // STEP 2  Ask confirmation
            // ─────────────────────────────────────────────
            bot.sendMessage(
                chatId,
                ` Are you sure you want to delete manager **${user}**?\nType **yes** to confirm.`,
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!managerDelete[chatId] || managerDelete[chatId].step !== 2) return;

                const confirm = r2.text.trim().toLowerCase();
                const target = managerDelete[chatId].user;
                delete managerDelete[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — No manager deleted.");

                bot.sendMessage(chatId,` Deleting manager *${target}*...`,
                { parse_mode:"Markdown" });

                // ─────────────────────────────────────────────
                // API CALL
                // ─────────────────────────────────────────────
                try {
                    const url = `${BASE}/seller_manager_delete.php?sellerkey=${SELLER}&username=${target}`;
                    const res = await axios.get(url);

                    if (!res.data.success)
                        return bot.sendMessage(chatId," " + res.data.msg);

                    if (res.data.deleted > 0)
                        return bot.sendMessage(chatId,` Manager **${target}** deleted successfully!`);
                    else
                        return bot.sendMessage(chatId,` Manager **${target}** not found.`);

                } catch (e) {
                    console.log(e);
                    bot.sendMessage(chatId," API request failed.");
                }
            });
        });
    }
};
