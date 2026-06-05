import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  success: boolean;
  dbPath?: string;
  fileName?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Upload`;

  /**
   * Uploads a file to a specific generic folder on the server.
   * @param file The file to upload.
   * @param folder The folder to store the file in (e.g., 'general', 'avatars').
   */
  uploadFile(file: File, folder: string = 'general'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('folder', folder);

    return this.http.post<UploadResponse>(this.apiUrl, formData);
  }

  /**
   * Helper to construct a full URL for downloading/viewing a file from the server's static files.
   * @param relativePath The relative path (e.g., '/uploads/general/file.png')
   */
  getFileUrl(relativePath: string): string {
    if (!relativePath) return '';
    // If the path already has a domain (e.g., from an external source), return as is
    if (relativePath.startsWith('http')) return relativePath;
    
    // Otherwise construct full URL based on the current environment's backend host
    // Assuming environment.apiUrl is like 'http://localhost:5000/api'
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    
    // Ensure relativePath starts with '/'
    const safeRelativePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    return `${baseUrl}${safeRelativePath}`;
  }

  /**
   * Trigger a secure download via the Download API.
   * Use this if the file is protected and not available via static file hosting.
   * @param filePath The path of the file to download.
   */
  downloadSecureFile(filePath: string): void {
    const url = `${this.apiUrl}/DownloadFile?filePath=${encodeURIComponent(filePath)}`;
    
    // For secure downloads requiring Authorization headers, we can't just use window.open.
    // We would need to do an HTTP GET with responseType: 'blob'
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Extract filename from path
        const filename = filePath.split('/').pop() || 'downloaded-file';
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => {
        console.error('Failed to download file', err);
      }
    });
  }
}
