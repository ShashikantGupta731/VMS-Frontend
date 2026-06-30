import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { CryptoService } from '../services/crypto.service';

export const encryptionInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  
  // Skip specific routes (same as backend middleware config)
  const urlLower = req.url.toLowerCase();
  if (urlLower.includes('/auth/public-key') ||
      urlLower.includes('/api/upload') ||
      urlLower.includes('/api/ifmsintegration')) {
    return next(req);
  }

  const cryptoService = inject(CryptoService);

  return from(cryptoService.getServerPublicKey()).pipe(
    switchMap(publicKey => {
      let clonedReq = req;
      let aesKeyBase64: string | null = null;

      // --- ENCRYPTION (Outgoing Request) ---
      if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        
        return from((async () => {
          // 1. Generate AES Key
          aesKeyBase64 = cryptoService.generateAesKey();
          
          // 2. Encrypt Payload
          const encryptedPayloadString = cryptoService.encryptPayloadWithAes(req.body, aesKeyBase64);
          
          // 3. Encrypt AES Key with RSA (async now)
          const encryptedAesKey = await cryptoService.encryptAesKeyWithRsa(aesKeyBase64, publicKey);

          console.log(`\n--- FRONTEND ENCRYPTION FLOW START ---`);
          console.log(`[EncryptionInterceptor] Method: ${req.method} | URL: ${req.url}`);
          console.log(`[EncryptionInterceptor] Original Request Payload:`, req.body);
          console.log(`[EncryptionInterceptor] Encrypted Payload Sent:`, encryptedPayloadString);

          // 4. Clone Request
          return req.clone({
            body: encryptedPayloadString,
            setHeaders: {
              'X-Encrypted-Key': encryptedAesKey
            }
          });
        })()).pipe(
          switchMap(clonedReq => processResponse(clonedReq))
        );
      }

      return processResponse(clonedReq);

      function processResponse(requestToProcess: HttpRequest<any>) {
        // --- DECRYPTION (Incoming Response) ---
        return next(requestToProcess).pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse && aesKeyBase64 && event.body) {
            if (typeof event.body === 'object' && event.body.iv && event.body.cipher) {
              console.log(`[EncryptionInterceptor] Received Encrypted Response:`, event.body);
              
              const encryptedStr = JSON.stringify(event.body);
              const decryptedPayload = cryptoService.decryptPayloadWithAes(encryptedStr, aesKeyBase64);
              
              console.log(`[EncryptionInterceptor] Decrypted Response:`, decryptedPayload);
              console.log(`--- FRONTEND ENCRYPTION FLOW END ---\n`);
              
              return event.clone({ body: decryptedPayload });
            }
          }
          return event;
        })
      );
      } // Close processResponse
    }) // Close switchMap
  );
};
