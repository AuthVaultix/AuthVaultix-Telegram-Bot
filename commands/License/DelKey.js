const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");

require("dotenv").config();

let delKeyFlow = {};

module.exports = {
    name: "delkey",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);

        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ────────────────────────────────
        // STEP 1  Ask License
        // ────────────────────────────────
        bot.sendMessage(chatId," Enter **license key** to delete:",
        { parse_mode:"Markdown" });

        delKeyFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!delKeyFlow[chatId] || delKeyFlow[chatId].step !== 1) return;

            const license = r1.text.trim();
            delKeyFlow[chatId] = { step: 2, license };

            // ────────────────────────────────
            // STEP 2  Confirmation
            // ────────────────────────────────
            bot.sendMessage(chatId,
                ` Are you sure you want to delete:\n\`${license}\`\nReply **yes** to confirm.`,
                { parse_mode:"Markdown" }
            );

            bot.once("message", async r2 => {
                if (!delKeyFlow[chatId] || delKeyFlow[chatId].step !== 2) return;

                const confirm = r2.text.trim().toLowerCase();
                const target = delKeyFlow[chatId].license;
                delete delKeyFlow[chatId];

                if (confirm !== "yes")
                    return bot.sendMessage(chatId," Cancelled — no key deleted.");

                bot.sendMessage(chatId," Deleting license...",
                { parse_mode:"Markdown" });

                try {
                    const url = `${BASE}/seller_delete_license.php?sellerkey=${SELLER}&type=delete&license=${target}`;
                    const res = await axios.get(url);

                    if (typeof res.data === "object" && !res.data.success)
                        return bot.sendMessage(chatId," " + (res.data.msg || "Failed to delete"));

                    if (!res.data.deleted || res.data.deleted.length === 0)
                        return bot.sendMessage(chatId," No license deleted (possibly invalid license)");

                    return bot.sendMessage(
                        chatId,
                        ` **Deleted License:**\n\`\`\`\n${res.data.deleted.join("\n")}\n\`\`\``,
                        { parse_mode:"Markdown" }
                    );

                } catch (e) {
                    console.log(e);
                    bot.sendMessage(chatId," API request failed.");
                }
            });
        });
    }
};
