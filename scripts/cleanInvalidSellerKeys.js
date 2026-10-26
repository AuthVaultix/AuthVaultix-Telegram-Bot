/**
 * ============================================================
 *  CRONJOB: CLEAN INVALID SELLER KEYS (TELEGRAM BOT)
 * ============================================================
 *
 *  Iterates over all stored seller keys in the SQLite database,
 *  validates each key against the AuthVaultix API:
 *  https://authvaultix.com/api/getApplicationFromSellerKey.php?sellerkey=<key>
 *
 *  If any key is invalid or revoked, it automatically deletes it
 *  from the database so dead/revoked keys don't linger.
 *
 *  Cronjob Example (runs daily at 2:00 AM on Linux VPS):
 *  0 2 * * * cd /path/to/bot && node scripts/cleanInvalidSellerKeys.js >> logs/cron_clean_keys.log 2>&1
 *
 *  Manual run:
 *  node scripts/cleanInvalidSellerKeys.js
 * ============================================================
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const axios = require("axios");
const { db, deleteSellerKey } = require("../utils/db");
const { decrypt } = require("../utils/crypto");

const API_ENDPOINT = "https://authvaultix.com/api/getApplicationFromSellerKey.php";
const REQUEST_TIMEOUT_MS = 10000;

async function checkKeyWithApi(sellerKey) {
    try {
        const url = `${API_ENDPOINT}?sellerkey=${encodeURIComponent(sellerKey)}`;
        const res = await axios.get(url, {
            timeout: REQUEST_TIMEOUT_MS,
            validateStatus: () => true
        });

        if (res.status === 200 && res.data && res.data.success === true && res.data.application?.name) {
            return { valid: true, appName: res.data.application.name };
        }

        const reason = res.data?.message || res.data?.msg || `HTTP ${res.status}`;
        return { valid: false, reason };
    } catch (err) {
        // If it's a network/timeout error, do NOT delete the key accidentally
        return { valid: null, error: err.message };
    }
}

async function cleanInvalidSellerKeys() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Starting Seller Key validation cronjob...`);

    const rows = db.prepare("SELECT chat_id, encrypted_key FROM seller_keys").all();

    if (!rows || rows.length === 0) {
        console.log(`ℹ️  No seller keys found in database. Nothing to clean.`);
        return { total: 0, valid: 0, deleted: 0, skipped: 0 };
    }

    console.log(`📊 Found ${rows.length} total seller key(s) in SQLite database. Validating...`);

    let validCount = 0;
    let deletedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
        let decryptedKey;
        try {
            decryptedKey = decrypt(row.encrypted_key);
        } catch (decErr) {
            console.error(`⚠️  Failed to decrypt key for chat_id ${row.chat_id}:`, decErr.message);
            decryptedKey = null;
        }

        if (!decryptedKey) {
            console.log(`🗑️  Deleting un-decryptable / corrupted key for chat_id ${row.chat_id}...`);
            deleteSellerKey(row.chat_id);
            deletedCount++;
            continue;
        }

        const check = await checkKeyWithApi(decryptedKey);

        if (check.valid === true) {
            validCount++;
            console.log(`✅ [Valid] Chat ID: ${row.chat_id} | App: '${check.appName}'`);
        } else if (check.valid === false) {
            console.log(`❌ [Invalid] Chat ID: ${row.chat_id} | Reason: ${check.reason} -> Deleting...`);
            deleteSellerKey(row.chat_id);
            deletedCount++;
        } else {
            // Network issue / timeout: do not delete
            skippedCount++;
            console.warn(`⚠️  [Skipped due to network error] Chat ID: ${row.chat_id} | Error: ${check.error}`);
        }
    }

    console.log("----------------------------------------------------------------");
    console.log(`📋 Cleanup Summary:`);
    console.log(`   Total checked: ${rows.length}`);
    console.log(`   ✅ Valid:      ${validCount}`);
    console.log(`   🗑️  Deleted:    ${deletedCount}`);
    console.log(`   ⚠️  Skipped:    ${skippedCount}`);
    console.log("----------------------------------------------------------------\n");

    return { total: rows.length, valid: validCount, deleted: deletedCount, skipped: skippedCount };
}

if (require.main === module) {
    cleanInvalidSellerKeys()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("❌ Fatal error in cleanInvalidSellerKeys:", err);
            process.exit(1);
        });
}

module.exports = { cleanInvalidSellerKeys };
