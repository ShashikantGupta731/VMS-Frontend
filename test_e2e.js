const crypto = require('crypto').webcrypto;
const CryptoJS = require('crypto-js');

async function runTest() {
  try {
    // 1. Fetch the SPKI Public Key from the local backend
    const res = await fetch('http://localhost:5261/api/auth/public-key');
    const data = await res.json();
    let pem = data.publicKey;
    
    // Format to PEM
    if (!pem.startsWith('-----BEGIN PUBLIC KEY-----')) {
       pem = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    }

    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\s/g, '');
    
    const binaryDerString = atob(pemContents);
    const binaryDer = new ArrayBuffer(binaryDerString.length);
    const bytes = new Uint8Array(binaryDer);
    for (let i = 0; i < binaryDerString.length; i++) {
      bytes[i] = binaryDerString.charCodeAt(i);
    }

    // 2. Import Key
    const importedKey = await crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    // 3. Generate AES Key and Encrypt Payload
    const aesKeyBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(32));
    const payload = { Username: "admin", Password: "password123", CaptchaId: "test", CaptchaInput: "test" };
    const jsonString = JSON.stringify(payload);
    const aesKey = CryptoJS.enc.Base64.parse(aesKeyBase64);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(jsonString, aesKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
    const cipherBase64 = encrypted.toString();
    const encryptedPayloadString = JSON.stringify({ iv: ivBase64, cipher: cipherBase64 });

    // 4. Encrypt the AES Key
    const enc = new TextEncoder();
    const encodedAesKey = enc.encode(aesKeyBase64);

    const encryptedBuf = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      importedKey,
      encodedAesKey
    );

    let binary = '';
    const bytesResponse = new Uint8Array(encryptedBuf);
    for (let i = 0; i < bytesResponse.byteLength; i++) {
        binary += String.fromCharCode(bytesResponse[i]);
    }
    const encryptedKeyBase64 = btoa(binary);

    // 5. Send to Backend
    console.log("Sending POST Request...");
    const postRes = await fetch('http://localhost:5261/api/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:4200',
        'Content-Type': 'application/json',
        'X-Encrypted-Key': encryptedKeyBase64
      },
      body: encryptedPayloadString
    });
    
    const text = await postRes.text();
    console.log(`Backend Status: ${postRes.status}`);
    console.log(`Backend Response: ${text}`);

  } catch(e) {
    console.error(e);
  }
}
runTest();
