import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SecretaryDto {
  secretaryId: number;
  title: string;
  emailId: string;
  deptId: number;
  departmentName: string;
  isActive: boolean;
}

export interface CreateSecretaryDto {
  title: string;
  emailId: string;
  deptId: number;
  isActive: boolean;
}

export interface UpdateSecretaryDto {
  title: string;
  emailId: string;
  deptId: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SecretaryService {
  private apiUrl = `${environment.apiUrl}/api/Secretaries`;

  constructor(private http: HttpClient) {}

  getAllSecretaries(): Observable<SecretaryDto[]> {
    return this.http.get<SecretaryDto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getSecretaryById(id: number): Observable<SecretaryDto> {
    return this.http.get<SecretaryDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createSecretary(data: CreateSecretaryDto): Observable<SecretaryDto> {
    return this.http.post<SecretaryDto>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  updateSecretary(id: number, data: UpdateSecretaryDto): Observable<SecretaryDto> {
    return this.http.put<SecretaryDto>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  toggleSecretaryStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      catchError(this.handleError)
    );
  }

  deleteSecretary(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
