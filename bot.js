require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// Token will load from .env
const bot = new TelegramBot(process.env.TOKEN, { 
    polling: { interval: 300, autoStart: true }
});

// Auto Load Command System
const commands = new Map();

function loadCommands(dir = "commands") {
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.lstatSync(full).isDirectory()) return loadCommands(full);

        if (file.endsWith(".js")) {
            try {
                const cmd = require(path.resolve(full));
                commands.set(cmd.name, cmd.run);
                console.log("[OK] Command Loaded:", cmd.name);
            } catch (err) {
                console.log("[ERROR] Command Error:", file, err.message);
            }
        }
    });
}
loadCommands();

console.log("Telegram Bot Started Successfully");

// /start message
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Authvaultix Telegram Bot Online!\nUse /help to see all commands.`);
});

global.userState = {}; // store per-chat command state

// Universal Handler (Runs every command automatically)
bot.on("message", async msg => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // If waiting for next input
    if (userState[chatId] && userState[chatId].handler) {
        return userState[chatId].handler(msg, bot);
    }

    // Command Trigger
    if (text.startsWith("/")) {
        const cmdName = text.slice(1).split(" ")[0].toLowerCase();

        if (commands.has(cmdName)) {
            return commands.get(cmdName)(bot, msg, text.split(" "));
        }
    }
});

// Inline Keyboard Callback Query Handler (Switch App / Delete App)
bot.on("callback_query", async (query) => {
    if (!query.data || !query.message) return;

    const chatId = query.message.chat.id.toString();
    const messageId = query.message.message_id;
    const data = query.data;

    const { switchActiveApp, getActiveApp, getUserApps, deleteUserApp } = require("./utils/db");

    if (data.startsWith("switch_app:")) {
        const targetApp = data.slice("switch_app:".length);
        switchActiveApp(chatId, targetApp);

        try {
            await bot.answerCallbackQuery(query.id, { text: `Active app set to ${targetApp}!` });
        } catch {}

        const apps = getUserApps(chatId);
        const keyboard = apps.map(app => [{
            text: app === targetApp ? `✅ ${app} (Active)` : `📱 ${app}`,
            callback_data: `switch_app:${app}`
        }]);

        try {
            await bot.editMessageText(
                `🔄 *Active Application Switched*\n\nCurrent Active: **\`${targetApp}\`**\n\nTap below to switch anytime:`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: keyboard }
                }
            );
        } catch {}

    } else if (data.startsWith("delete_app:")) {
        const targetApp = data.slice("delete_app:".length);
        const res = deleteUserApp(chatId, targetApp);

        try {
            await bot.answerCallbackQuery(query.id, { text: `Deleted ${targetApp}` });
        } catch {}

        const newActive = res.newActiveApp;
        const remaining = res.remainingApps;

        if (!remaining || remaining.length === 0) {
            try {
                await bot.editMessageText(
                    `🗑️ *Application Deleted*\n\nRemoved: \`${targetApp}\`\n\nYou have no remaining applications. Use /setsellerkey to add an app.`,
                    { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" }
                );
            } catch {}
        } else {
            const keyboard = remaining.map(app => [{
                text: `❌ Delete ${app}`,
                callback_data: `delete_app:${app}`
            }]);

            try {
                await bot.editMessageText(
                    `🗑️ *Application Deleted*\n\nRemoved: \`${targetApp}\`\nNew Active Application: **\`${newActive}\`**\n\nRemaining applications:`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: "Markdown",
                        reply_markup: { inline_keyboard: keyboard }
                    }
                );
            } catch {}
        }
    }
});
