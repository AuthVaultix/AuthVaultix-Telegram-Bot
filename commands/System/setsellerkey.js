const { setSellerKey } = require("../../utils/db");

module.exports = {
    name: "setsellerkey",

    run(bot, msg, args){

        const chatId = msg.chat.id.toString();
        const key = args[1];

        // User message based key input mode
        if(!key){
            bot.sendMessage(chatId," Enter your Seller Key:");
            global.userState[chatId] = {
                handler:(reply)=> save(reply.text.trim(),chatId,bot)
            };
            return;
        }

        save(key,chatId,bot);
    }
}

function save(key,chatId,bot){
    setSellerKey(chatId, key);
    bot.sendMessage(chatId," Seller Key has been successfully saved ");
    delete global.userState[chatId];
}
