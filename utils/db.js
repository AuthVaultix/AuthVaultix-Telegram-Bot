require("dotenv").config();
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");
const { encrypt, decrypt } = require("./crypto");

const dbPath = path.resolve(__dirname, "..", "bot.db");
const db = new DatabaseSync(dbPath);

// Initialize schema with multi-app support
db.exec(`
    CREATE TABLE IF NOT EXISTS user_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        app_name TEXT NOT NULL,
        encrypted_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, app_name)
    );

    CREATE TABLE IF NOT EXISTS active_apps (
        chat_id TEXT PRIMARY KEY,
        active_app TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seller_keys (
        chat_id TEXT PRIMARY KEY,
        encrypted_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Migration from legacy seller_keys to user_apps if needed
try {
    const legacyRows = db.prepare("SELECT chat_id, encrypted_key FROM seller_keys").all();
    for (const row of legacyRows) {
        const existing = db.prepare("SELECT id FROM user_apps WHERE chat_id = ?").all(row.chat_id);
        if (!existing || existing.length === 0) {
            db.prepare("INSERT OR IGNORE INTO user_apps (chat_id, app_name, encrypted_key) VALUES (?, ?, ?)").run(row.chat_id, "Default-App", row.encrypted_key);
            db.prepare("INSERT OR REPLACE INTO active_apps (chat_id, active_app) VALUES (?, ?)").run(row.chat_id, "Default-App");
        }
    }
} catch {
    // Migration ignore
}

function getUserApps(chatId) {
    if (!chatId) return [];
    const rows = db.prepare("SELECT app_name FROM user_apps WHERE chat_id = ? ORDER BY id ASC").all(chatId.toString());
    return rows.map(r => r.app_name);
}

function getActiveApp(chatId) {
    if (!chatId) return null;
    const row = db.prepare("SELECT active_app FROM active_apps WHERE chat_id = ?").get(chatId.toString());
    if (row && row.active_app) return row.active_app;
    const apps = getUserApps(chatId);
    return apps.length > 0 ? apps[0] : null;
}

function switchActiveApp(chatId, appName) {
    if (!chatId || !appName) return false;
    db.prepare("INSERT OR REPLACE INTO active_apps (chat_id, active_app, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(chatId.toString(), appName);
    
    // Also keep legacy seller_keys aligned for complete backward-compatibility
    const row = db.prepare("SELECT encrypted_key FROM user_apps WHERE chat_id = ? AND app_name = ?").get(chatId.toString(), appName);
    if (row && row.encrypted_key) {
        db.prepare("INSERT OR REPLACE INTO seller_keys (chat_id, encrypted_key) VALUES (?, ?)").run(chatId.toString(), row.encrypted_key);
    }
    return true;
}

function getUniqueAppName(chatId, baseName) {
    const apps = getUserApps(chatId);
    if (!apps.includes(baseName)) return baseName;
    let i = 2;
    while (apps.includes(`${baseName}-${i}`)) i++;
    return `${baseName}-${i}`;
}

function setSellerKey(chatId, baseAppName, plainKey) {
    if (!chatId || !plainKey) return null;
    const cId = chatId.toString();
    const finalName = getUniqueAppName(cId, baseAppName || "App");
    const encrypted = encrypt(plainKey.trim());

    db.prepare("INSERT OR REPLACE INTO user_apps (chat_id, app_name, encrypted_key) VALUES (?, ?, ?)").run(cId, finalName, encrypted);
    db.prepare("INSERT OR REPLACE INTO active_apps (chat_id, active_app, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(cId, finalName);
    db.prepare("INSERT OR REPLACE INTO seller_keys (chat_id, encrypted_key) VALUES (?, ?)").run(cId, encrypted);

    return finalName;
}

function deleteUserApp(chatId, appName) {
    if (!chatId || !appName) return { success: false, newActiveApp: null, remainingApps: [] };
    const cId = chatId.toString();
    db.prepare("DELETE FROM user_apps WHERE chat_id = ? AND app_name = ?").run(cId, appName);

    const remaining = getUserApps(cId);
    const active = getActiveApp(cId);

    let nextApp = null;
    if (active === appName) {
        if (remaining.length > 0) {
            nextApp = remaining[0];
            db.prepare("INSERT OR REPLACE INTO active_apps (chat_id, active_app, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(cId, nextApp);
            const nextRow = db.prepare("SELECT encrypted_key FROM user_apps WHERE chat_id = ? AND app_name = ?").get(cId, nextApp);
            if (nextRow) {
                db.prepare("INSERT OR REPLACE INTO seller_keys (chat_id, encrypted_key) VALUES (?, ?)").run(cId, nextRow.encrypted_key);
            }
        } else {
            db.prepare("DELETE FROM active_apps WHERE chat_id = ?").run(cId);
            db.prepare("DELETE FROM seller_keys WHERE chat_id = ?").run(cId);
        }
    } else {
        nextApp = active;
    }

    return { success: true, newActiveApp: nextApp, remainingApps: remaining };
}

function getSellerKey(chatId) {
    if (!chatId) return null;
    const cId = chatId.toString();
    const active = getActiveApp(cId);

    if (active) {
        const row = db.prepare("SELECT encrypted_key FROM user_apps WHERE chat_id = ? AND app_name = ?").get(cId, active);
        if (row && row.encrypted_key) {
            try {
                return decrypt(row.encrypted_key);
            } catch {
                return null;
            }
        }
    }

    // Fallback to legacy seller_keys
    const legacyRow = db.prepare("SELECT encrypted_key FROM seller_keys WHERE chat_id = ?").get(cId);
    if (legacyRow && legacyRow.encrypted_key) {
        try {
            return decrypt(legacyRow.encrypted_key);
        } catch {
            return null;
        }
    }

    return null;
}

module.exports = {
    getSellerKey,
    setSellerKey,
    getUserApps,
    getActiveApp,
    switchActiveApp,
    deleteUserApp,
    db
};
