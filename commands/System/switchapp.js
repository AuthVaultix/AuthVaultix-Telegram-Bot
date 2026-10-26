const { getUserApps, getActiveApp } = require("../../utils/db");

module.exports = {
    name: "switchapp",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();
        const apps = getUserApps(chatId);

        if (!apps || apps.length === 0) {
            return bot.sendMessage(
                chatId,
                "⚠️ *No applications registered yet.*\n\nPlease use /setsellerkey to add your first application.",
                { parse_mode: "Markdown" }
            );
        }

        const activeApp = getActiveApp(chatId);

        const keyboard = apps.map(app => [{
            text: app === activeApp ? `✅ ${app} (Active)` : `📱 ${app}`,
            callback_data: `switch_app:${app}`
        }]);

        const text =
`🔄 *Switch Active Application*

Current Active: **\`${activeApp || "None"}\`**

Select an application below to switch:
_(Commands like /genkey, /createuser will use the active app)_`;

        bot.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });
    }
};
