const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8'); // 32 byte key
const ivSize = 16;

/**
 * Encrypts a string
 * @param {string} text 
 * @returns {string} iv:encrypted_data
 */
const encrypt = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(ivSize);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypts a string
 * @param {string} text (format iv:encrypted_data)
 * @returns {string} decrypted string
 */
const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    try {
        const [ivHex, encryptedText] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return null; // or return original if it wasn't encrypted
    }
};

module.exports = { encrypt, decrypt };
