const { getUserApps, getActiveApp } = require("../../utils/db");

module.exports = {
    name: "myapps",

    async run(bot, msg) {
        const chatId = msg.chat.id.toString();
        const apps = getUserApps(chatId);

        if (!apps || apps.length === 0) {
            return bot.sendMessage(
                chatId,
                "⚠️ *No applications registered yet.*\n\nUse /setsellerkey to add your first application.",
                { parse_mode: "Markdown" }
            );
        }

        const activeApp = getActiveApp(chatId);

        let listText = apps.map((app, idx) => {
            const isCurrent = app === activeApp;
            return `${idx + 1}. \`${app}\` ${isCurrent ? "— 🎯 *(ACTIVE)*" : ""}`;
        }).join("\n");

        const reply =
`📱 *Your Registered Applications:*
${listText}

• Current Active: **\`${activeApp || "None"}\`**
• Total Apps: **${apps.length}**

_Use /switchapp to switch apps or /deleteapp to remove an app._`;

        const keyboard = apps.length > 1 ? apps.map(app => [{
            text: app === activeApp ? `✅ ${app} (Active)` : `Switch to ${app}`,
            callback_data: `switch_app:${app}`
        }]) : [];

        if (keyboard.length > 0) {
            return bot.sendMessage(chatId, reply, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: keyboard }
            });
        }

        return bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    }
};
