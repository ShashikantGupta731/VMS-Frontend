import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Helper to get full URL
  private getFullUrl(endpoint: string): string {
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  // Generic GET request
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.getFullUrl(endpoint));
  }

  // Generic POST request
  post<T>(endpoint: string, body: any): Observable<T> {
    const fullUrl = this.getFullUrl(endpoint);
    console.log(`6. ApiService.post: Request initiated to ${fullUrl}`);
    console.log('7. ApiService.post: Body payload:', JSON.stringify({ ...body, Password: '***' }));
    return this.http.post<T>(fullUrl, body);
  }

  // Generic PUT request
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(this.getFullUrl(endpoint), body);
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.getFullUrl(endpoint));
  }

  // POST with custom headers (if needed)
  postWithHeaders<T>(endpoint: string, body: any, headers: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.getFullUrl(endpoint), body, { headers });
  }
}