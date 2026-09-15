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
        const cmdName = text.slice(1).split(" ")[0];

        if (commands.has(cmdName)) {
            return commands.get(cmdName)(bot, msg, text.split(" "));
        }
    }
});
