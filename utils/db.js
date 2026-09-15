require("dotenv").config();
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");
const { encrypt, decrypt } = require("./crypto");

const dbPath = path.resolve(__dirname, "..", "bot.db");
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
    CREATE TABLE IF NOT EXISTS seller_keys (
        chat_id TEXT PRIMARY KEY,
        encrypted_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);



const getStmt = db.prepare("SELECT encrypted_key FROM seller_keys WHERE chat_id = ?");
const setStmt = db.prepare("INSERT OR REPLACE INTO seller_keys (chat_id, encrypted_key) VALUES (?, ?)");
const delStmt = db.prepare("DELETE FROM seller_keys WHERE chat_id = ?");

module.exports = {
    getSellerKey(chatId) {
        if (!chatId) return null;
        const row = getStmt.get(chatId.toString());
        if (!row || !row.encrypted_key) return null;
        try {
            return decrypt(row.encrypted_key);
        } catch {
            return null;
        }
    },

    setSellerKey(chatId, plainKey) {
        if (!chatId || !plainKey) return false;
        const encrypted = encrypt(plainKey.trim());
        setStmt.run(chatId.toString(), encrypted);
        return true;
    },

    deleteSellerKey(chatId) {
        if (!chatId) return false;
        delStmt.run(chatId.toString());
        return true;
    },

    db
};
