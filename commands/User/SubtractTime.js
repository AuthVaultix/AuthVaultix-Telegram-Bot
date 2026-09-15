const axios = require("axios");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let waitSubUser = {};
let waitSubDays = {};

module.exports = {
    name: "subtime",

    async run(bot, msg) {

        const chatId = msg.chat.id.toString();
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the /setsellerkey command.");

        // STEP 1 — ASK USERNAME
        bot.sendMessage(chatId,"Enter the *username* to subtract time from:",{ parse_mode:"Markdown" });

        waitSubUser[chatId] = true;

        bot.once("message", async res1 => {
            if (!waitSubUser[chatId]) return;

            const username = res1.text.trim();
            delete waitSubUser[chatId];

            bot.sendMessage(chatId,
`How many *days* to subtract from \`${username}\`?`,
{ parse_mode:"Markdown" });

            waitSubDays[chatId] = { username };

            bot.once("message", async res2 => {
                if (!waitSubDays[chatId]) return;

                const days = parseInt(res2.text.trim());
                const user = waitSubDays[chatId].username;
                delete waitSubDays[chatId];

                if (isNaN(days) || days <= 0)
                    return bot.sendMessage(chatId,"Enter valid number of days.");

                bot.sendMessage(chatId,`Subtracting **${days} days** from **${user}**...`);

                const url = `${BASE}/subtract_time.php?sellerkey=${SELLER}&username=${encodeURIComponent(user)}&days=${days}`;

                try {
                    const r = await axios.get(url);

                    if (!r.data.success)
                        return bot.sendMessage(chatId,`Error: ${r.data.msg}`);

                    return bot.sendMessage(chatId,
`*Time Updated Successfully*\nUser: \`${user}\`\nRemoved: *${days} days*`,
                    { parse_mode:"Markdown" });

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId,"API Failed — check console.");
                }
            });
        });
    }
};
