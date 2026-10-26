const axios = require("axios");
const { setSellerKey, getUserApps } = require("../../utils/db");

const API_ENDPOINT = "https://authvaultix.com/api/getApplicationFromSellerKey.php";

module.exports = {
    name: "setsellerkey",

    async run(bot, msg, args) {
        const chatId = msg.chat.id.toString();
        const key = args && args[1] ? args[1].trim() : null;

        if (!key) {
            bot.sendMessage(chatId, "🔐 Please enter your *AuthVaultix Seller Key*:", { parse_mode: "Markdown" });
            global.userState[chatId] = {
                handler: (reply) => saveKey(reply.text.trim(), chatId, bot)
            };
            return;
        }

        await saveKey(key, chatId, bot);
    }
};

async function saveKey(rawKey, chatId, bot) {
    delete global.userState[chatId];

    bot.sendMessage(chatId, "⏳ Validating seller key with AuthVaultix...", { parse_mode: "Markdown" });

    try {
        const url = `${API_ENDPOINT}?sellerkey=${encodeURIComponent(rawKey)}`;
        const res = await axios.get(url, { timeout: 10000 });

        if (!res.data || !res.data.success || !res.data.application?.name) {
            const errMsg = res.data?.message || res.data?.msg || "Invalid seller key";
            return bot.sendMessage(
                chatId,
                `❌ *Invalid Seller Key*\n\nServer response: **${errMsg}**\nPlease make sure your key is active in your AuthVaultix dashboard.`,
                { parse_mode: "Markdown" }
            );
        }

        const baseAppName = res.data.application.name;
        const finalAppName = setSellerKey(chatId, baseAppName, rawKey);

        const apps = getUserApps(chatId);

        let replyText =
`✅ *Seller Key Saved Successfully!*

📱 **Application:** \`${finalAppName}\`
🎯 **Active App:** Automatically set to **\`${finalAppName}\`**!

• Use /switchapp anytime to switch between apps
• Use /deleteapp to remove an app
• Use /myapps to see all your registered apps`;

        if (apps.length > 1) {
            const keyboard = apps.map(app => [{
                text: app === finalAppName ? `✅ ${app} (Active)` : `📱 ${app}`,
                callback_data: `switch_app:${app}`
            }]);

            return bot.sendMessage(chatId, replyText, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: keyboard }
            });
        }

        return bot.sendMessage(chatId, replyText, { parse_mode: "Markdown" });

    } catch (err) {
        console.error("SETSELLERKEY ERROR:", err.message);
        return bot.sendMessage(chatId, `❌ *Failed to validate key:*\n${err.message}`, { parse_mode: "Markdown" });
    }
}
