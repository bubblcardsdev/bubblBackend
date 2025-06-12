/* eslint-disable linebreak-style */
import crypto from "crypto";

const encrypt = function (plainText, workingKey) {
    var m = crypto.createHash("md5");
    m.update(workingKey);
    var key = m.digest().slice(0, 16); // truncate to 16 bytes
    var iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
    var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    var encoded = cipher.update(plainText,"utf8","hex");
    encoded += cipher.final("hex");
    return encoded;
};

const decrypt = function (encText, workingKey) {
    var m = crypto.createHash("md5");
    m.update(workingKey);
    var key = m.digest().slice(0, 16);
	var iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";	
	var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    	var decoded = decipher.update(encText,"hex","utf8");
	decoded += decipher.final("utf8");
    	return decoded;
};


function base64UrlDecode(base64Url) {
    // Replace URL-safe characters
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if necessary
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return Buffer.from(base64 + padding, "base64");
  }
const decryptProfileId = function (encryptedText) {
    const key = "bubblprofikey123";
    const iv = "profilekey2025bl";
    const encryptedBuffer = base64UrlDecode(encryptedText);
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decrypted = decipher.update(encryptedBuffer, null, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;  
  };
export {encrypt, decrypt, decryptProfileId};


