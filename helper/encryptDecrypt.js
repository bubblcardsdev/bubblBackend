/* eslint-disable linebreak-style */
import crypto from "crypto";


const secretKey = "jYhIKG4OI7q6yQPAwCIKu1sf0Qh3DWTn"; 
const algorithm = "aes-256-cbc"; 

// Function to encrypt the ID
function id_encrypt(id) {
    const iv = crypto.randomBytes(16); // Generate a random 16-byte Initialization Vector (IV)
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf-8"), iv);
    let encrypted = cipher.update(id, "utf8", "hex");
    encrypted += cipher.final("hex");
    // Return both the IV and encrypted ID (so the IV can be used for decryption)
    return iv.toString("hex") + ":" + encrypted;
  }
  
  // Function to decrypt the encrypted ID
  function id_decrypt(encryptedId) {
    const [ivHex, encrypted] = encryptedId.split(":"); // Separate IV and encrypted data
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "utf-8"), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  export {id_encrypt,id_decrypt};