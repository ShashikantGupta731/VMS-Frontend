import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch Public Key from backend — always fresh, never cached.
  // WHY: The backend generates a NEW RSA key pair every time it restarts.
  // If we cache it in memory, a backend restart causes a key mismatch (0xc100000d error)
  // because we'd encrypt with the OLD public key but the backend decrypts with its NEW private key.
  async getServerPublicKey(): Promise<string> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/auth/public-key`)
      );
      console.log('[CryptoService] Fetched fresh RSA Public Key from server.');
      return response.publicKey;
    } catch (error) {
      console.error('[CryptoService] Failed to fetch RSA Public Key from server:', error);
      throw error;
    }
  }

  // Generate a random AES key (Base64)
  generateAesKey(): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(32)); // 256-bit key
  }

  // Encrypt payload with AES
  encryptPayloadWithAes(payload: any, aesKeyBase64: string): any {
    const jsonString = JSON.stringify(payload);
    const aesKey = CryptoJS.enc.Base64.parse(aesKeyBase64);
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(jsonString, aesKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return {
      iv: CryptoJS.enc.Base64.stringify(iv),
      cipher: encrypted.toString()
    };
  }

  // Decrypt payload with AES
  decryptPayloadWithAes(encryptedDataObjString: string, aesKeyBase64: string): any {
    try {
      const parsed = JSON.parse(encryptedDataObjString);
      const iv = CryptoJS.enc.Base64.parse(parsed.iv);
      const cipherText = parsed.cipher;
      const aesKey = CryptoJS.enc.Base64.parse(aesKeyBase64);

      const decrypted = CryptoJS.AES.decrypt(cipherText, aesKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  // Encrypt AES Key with RSA Public Key (Web Crypto API)
  async encryptAesKeyWithRsa(aesKeyBase64: string, publicKeyBase64: string): Promise<string> {
    let pem = publicKeyBase64;
    if (!pem.startsWith('-----BEGIN PUBLIC KEY-----')) {
       pem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    }

    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\s/g, '');
    
    const binaryDerString = window.atob(pemContents);
    const binaryDer = new ArrayBuffer(binaryDerString.length);
    const bytes = new Uint8Array(binaryDer);
    for (let i = 0; i < binaryDerString.length; i++) {
      bytes[i] = binaryDerString.charCodeAt(i);
    }

    const importedKey = await window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    const enc = new TextEncoder();
    const encodedAesKey = enc.encode(aesKeyBase64);

    const encryptedBuf = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      importedKey,
      encodedAesKey
    );

    // Convert ArrayBuffer to Base64
    let binary = '';
    const bytesResponse = new Uint8Array(encryptedBuf);
    const len = bytesResponse.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytesResponse[i]);
    }
    return window.btoa(binary);
  }
}
