"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
exports.eciesDecrypt = eciesDecrypt;
exports.aesGCMDecrypt = aesGCMDecrypt;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const const_1 = require("./const");
const eciesjs_1 = require("eciesjs");
const crypto = tslib_1.__importStar(require("crypto"));
const ivLength = 12;
const tagLength = 16;
async function deriveEncryptionKey(signer) {
    const signature = await signer.signMessage(const_1.MESSAGE_FOR_ENCRYPTION_KEY);
    const hash = ethers_1.ethers.sha256(ethers_1.ethers.toUtf8Bytes(signature));
    return hash;
}
async function encryptData(signer, data) {
    const key = await deriveEncryptionKey(signer);
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
}
async function decryptData(signer, encryptedData) {
    const key = await deriveEncryptionKey(signer);
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
}
async function eciesDecrypt(signer, encryptedData) {
    const privateKey = eciesjs_1.PrivateKey.fromHex(signer.privateKey);
    const data = Buffer.from(encryptedData, 'hex');
    const decrypted = (0, eciesjs_1.decrypt)(privateKey.secret, data);
    return decrypted.toString('hex');
}
async function aesGCMDecrypt(key, encryptedData) {
    const data = Buffer.from(encryptedData, 'hex');
    const iv = data.subarray(0, ivLength);
    const encryptedText = data.subarray(ivLength, data.length - tagLength);
    const authTag = data.subarray(data.length - tagLength, data.length);
    const privateKey = Buffer.from(key, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', privateKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=encrypt.js.map