const axios = require("axios");
const fs = require("fs");
const { getSellerKey } = require("../../utils/db");
require("dotenv").config();



module.exports = {
    name: "createuser",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();

        // Load and decrypt seller key
        const SELLER = getSellerKey(chatId);
        const BASE = process.env.BASE_URL;

        if (!SELLER)
            return bot.sendMessage(chatId,"It appears you haven't set a Seller Key yet. \n\nTo set one, use the  /setsellerkey command.");


        userState[chatId] = { step: 1, SELLER, handler: askUsername };
        bot.sendMessage(chatId," Enter *Username* for new user:",{ parse_mode:"Markdown" });
    }
};


// STEP 1
async function askUsername(msg, bot){
    const chatId = msg.chat.id;
    userState[chatId].username = msg.text.trim();
    userState[chatId].handler = askPassword;

    bot.sendMessage(chatId," Enter *Password*:",{ parse_mode:"Markdown" });
}

// STEP 2
async function askPassword(msg,bot){
    const chatId = msg.chat.id;
    userState[chatId].password = msg.text.trim();
    userState[chatId].handler = askSubscription;

    bot.sendMessage(chatId," Enter *Subscription* (VIP, BASIC...)",{ parse_mode:"Markdown" });
}

// STEP 3
async function askSubscription(msg,bot){
    const chatId = msg.chat.id;
    userState[chatId].subscription = msg.text.trim();
    userState[chatId].handler = askExpiry;

    bot.sendMessage(chatId," Enter Expiry in Days (0 = lifetime):",{ parse_mode:"Markdown"});
}

// STEP 4 = API REQUEST
async function askExpiry(msg,bot){
    const chatId = msg.chat.id;

    const { username,password,subscription,SELLER } = userState[chatId];
    const expiry = parseInt(msg.text.trim());
    const BASE   = process.env.BASE_URL;

    if(isNaN(expiry)) return bot.sendMessage(chatId," Expiry must be number");

    const url = `${BASE}/create_user.php?sellerkey=${SELLER}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&subscription=${encodeURIComponent(subscription)}&expiry=${expiry}`;

    try{
        const res = await axios.get(url);

        if(res.data.success){
            bot.sendMessage(chatId,
` *User Created Successfully!*
 Username: \`${username}\`
 Password: \`${password}\`
 Subscription: *${subscription}*
 Expires in: *${expiry} days*`,
{parse_mode:"Markdown"});
        } else {
            bot.sendMessage(chatId,` ${res.data.msg}`);
        }

    }catch{
        bot.sendMessage(chatId," API Failed");
    }

    delete userState[chatId];
}
