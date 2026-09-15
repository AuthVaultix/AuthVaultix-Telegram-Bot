const crypto = require("crypto");

const SECRET = process.env.ENCRYPT_KEY || "CHANGE_THIS_TO_STRONG_KEY"; // .env required
module.exports = {
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const key = crypto.createHash("sha256").update(SECRET).digest();
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

        const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");  // store IV + cipher
    },

    decrypt(hash) {
        const [ivHex, encryptedHex] = hash.split(":");
        const key = crypto.createHash("sha256").update(SECRET).digest();

        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            key,
            Buffer.from(ivHex, "hex")
        );

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex, "hex")),
            decipher.final()
        ]);

        return decrypted.toString("utf8");
    }
}
