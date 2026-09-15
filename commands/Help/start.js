module.exports = {
    name: "start",

    async run(bot, msg) {
        const chatId = msg.chat.id;

        const text = `
<b>Welcome to Authvaultix Telegram Panel</b>
Manage Licenses • Variables • Subscriptions • Logs • Sessions • Resellers & Managers

Use /help to view the complete command panel.
`;

        bot.sendMessage(chatId, text, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [
                    ["License Menu", "User Variables"],
                    ["Global Variables", "Subscriptions"],
                    ["Logs", "Sessions"],
                    ["Resellers", "Managers"],
                    ["Full Command List (/help)"]
                ],
                resize_keyboard: true
            }
        });

        // Auto show help also
        setTimeout(()=>{
            bot.sendMessage(chatId, " Opening Full Help Menu...", {parse_mode:"HTML"});
            require("./help").run(bot,msg);
        },1000);
    }
};
