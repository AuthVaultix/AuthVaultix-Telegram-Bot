const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
const { getSellerKey } = require("../../utils/db");



module.exports = {
    name: "changepassword",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();

        // seller key load + decrypt
        const SELLER = getSellerKey(chatId);
        const BASE   = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");

        // STEP 1  Ask Username
        userState[chatId] = {
            step: 1,
            SELLER,
            handler: askUsername
        };

        bot.sendMessage(chatId," Enter *username* to change password:",{parse_mode:"Markdown"});
    }
};


// STEP 1  Ask New Password
async function askUsername(msg, bot){
    const chatId = msg.chat.id;

    userState[chatId].username = msg.text.trim();
    userState[chatId].handler  = askNewPassword;

    bot.sendMessage(chatId," Enter *new password*:",{parse_mode:"Markdown"});
}


// STEP 2  API REQUEST (DECRYPTED SELLER KEY USED)
async function askNewPassword(msg, bot){
    const chatId  = msg.chat.id;
    const username = userState[chatId].username;
    const newPass  = msg.text.trim();

    const SELLER = userState[chatId].SELLER;  //  decrypted key
    const BASE   = process.env.BASE_URL;

    const url = `${BASE}/change_password.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}&newpass=${encodeURIComponent(newPass)}`;

    try{
        const res = await axios.get(url);

        if(res.data.success){
            bot.sendMessage(chatId,
` *Password Changed Successfully*
 User: \`${username}\`
 Password Updated `,
{parse_mode:"Markdown"});
        } else {
            bot.sendMessage(chatId,` ${res.data.msg}`);
        }

    }catch{
        bot.sendMessage(chatId," API Request Failed");
    }

    delete userState[chatId];
}
