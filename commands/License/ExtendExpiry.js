const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let stepData = {};

module.exports = {
    name: "extendexpiry",

    async run(bot, msg) {
        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // STEP 1  License Key
        bot.sendMessage(chatId," Enter *license key* to extend:", { parse_mode:"Markdown" });
        stepData[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!stepData[chatId] || stepData[chatId].step !== 1) return;
            const license = r1.text.trim();
            stepData[chatId] = { step:2, license };

            // STEP 2  Days
            bot.sendMessage(chatId," How many *days* to extend?",{ parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!stepData[chatId] || stepData[chatId].step !== 2) return;
                
                const days = parseInt(r2.text.trim());
                if (isNaN(days)) return bot.sendMessage(chatId," Invalid number of days.");

                stepData[chatId].days = days;
                stepData[chatId].step = 3;

                // STEP 3  Optional Note
                bot.sendMessage(chatId," Enter *note* (or type `skip`)");

                bot.once("message", async r3 => {
                    if (!stepData[chatId] || stepData[chatId].step !== 3) return;

                    const note = r3.text.trim().toLowerCase() === "skip" ? "" : r3.text.trim();
                    const { license, days } = stepData[chatId];
                    delete stepData[chatId];

                    bot.sendMessage(chatId," Updating expiry...",{ parse_mode:"Markdown" });

                    try {
                        const url = `${BASE}/seller_extend_expiry.php?sellerkey=${SELLER}&key=${license}&days=${days}&note=${encodeURIComponent(note)}`;
                        const res = await axios.get(url);

                        if (!res.data.success)
                            return bot.sendMessage(chatId," " + (res.data.message || "Failed"));

                        bot.sendMessage(
                            chatId,
                            ` *Expiry Extended Successfully!*\n License: \`${license}\`\n Days Added: *${days}*`,
                            { parse_mode:"Markdown" }
                        );

                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chatId," API Request Failed.");
                    }
                });
            });
        });
    }
};
