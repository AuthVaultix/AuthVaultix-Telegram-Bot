const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();

let noteFlow = {};

module.exports = {
    name: "setlicensenote",

    async run(bot, msg) {

        const chatId = msg.chat.id;
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        // ─────────────────────────────────────
        // STEP 1  ASK LICENSE KEY
        // ─────────────────────────────────────
        bot.sendMessage(chatId," Enter *license key* to update note:",
        { parse_mode:"Markdown" });

        noteFlow[chatId] = { step: 1 };

        bot.once("message", async r1 => {
            if (!noteFlow[chatId] || noteFlow[chatId].step !== 1) return;

            const license = r1.text.trim();
            noteFlow[chatId] = { step: 2, license };

            // ─────────────────────────────────────
            // STEP 2  ASK NOTE
            // ─────────────────────────────────────
            bot.sendMessage(chatId," Enter note to save:",
            { parse_mode:"Markdown" });

            bot.once("message", async r2 => {
                if (!noteFlow[chatId] || noteFlow[chatId].step !== 2) return;

                const note = r2.text.trim();
                const key  = noteFlow[chatId].license;

                delete noteFlow[chatId];

                bot.sendMessage(chatId," Updating note...",
                { parse_mode:"Markdown" });

                try {
                    const url = `${BASE}/seller_set_note.php?sellerkey=${SELLER}&license=${encodeURIComponent(key)}&note=${encodeURIComponent(note)}`;
                    const res = await axios.get(url);

                    if (typeof res.data === "object" && !res.data.success)
                        return bot.sendMessage(chatId," " + (res.data.msg || "Unknown Error"));

                    bot.sendMessage(chatId," **Note Updated Successfully!**",{ parse_mode:"Markdown" });

                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chatId," Failed — API Request Error");
                }
            });
        });
    }
};
