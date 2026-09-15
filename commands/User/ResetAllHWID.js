const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

module.exports = {
    name: "resethwidall",

    async run(bot, msg, args) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        //  Confirmation Required
        bot.sendMessage(chatId,
` *WARNING!*
This will reset HWID of **ALL USERS**.
This action **cannot be undone**.

Type:  *CONFIRM*  to continue`,
{ parse_mode:"Markdown" });

        // Wait for confirmation
        bot.once("message", async confirm => {

            if (confirm.text !== "CONFIRM")
                return bot.sendMessage(chatId," Cancelled — Action Not Confirmed.");

            bot.sendMessage(chatId," Resetting HWIDs for all users...");

            const url = `${BASE}/reset_all_hwid.php?sellerkey=${SELLER}`;

            try {
                const res = await axios.get(url);

                if (!res.data.success)
                    return bot.sendMessage(chatId,` Error: ${res.data.msg}`);

                bot.sendMessage(chatId,
` *HWID Reset Completed*
 Total Accounts Updated  *${res.data.reset_count}*`,
{ parse_mode:"Markdown" });

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId," API Request Failed — Check console.");
            }
        });
    }
};
