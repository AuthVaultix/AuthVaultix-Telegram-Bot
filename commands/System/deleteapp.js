const { getUserApps, getActiveApp } = require("../../utils/db");

module.exports = {
    name: "deleteapp",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();
        const apps = getUserApps(chatId);

        if (!apps || apps.length === 0) {
            return bot.sendMessage(
                chatId,
                "⚠️ *No applications registered.* Nothing to delete.\nUse /setsellerkey to add an app.",
                { parse_mode: "Markdown" }
            );
        }

        const activeApp = getActiveApp(chatId);

        const keyboard = apps.map(app => [{
            text: `❌ Delete ${app}${app === activeApp ? " (Current Active)" : ""}`,
            callback_data: `delete_app:${app}`
        }]);

        const text =
`🗑️ *Delete Application*

Current Active: **\`${activeApp || "None"}\`**

Select an application below to remove from the bot:
_(This only removes the key from the bot, it does NOT delete the app from your AuthVaultix dashboard)_`;

        bot.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });
    }
};
