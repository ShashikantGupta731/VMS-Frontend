import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserFormData } from './user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5261/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: UserFormData): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: UserFormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-username?username=${encodeURIComponent(username)}`);
  }

  getDdoList(deptId?: number, districtId?: number): Observable<any[]> {
    const params: string[] = [];
    if (deptId) params.push(`deptId=${deptId}`);
    if (districtId !== undefined && districtId !== null) params.push(`districtId=${districtId}`);
    const query = params.length > 0 ? '?' + params.join('&') : '';
    return this.http.get<any[]>(`${this.apiUrl}/ddo-list${query}`);
  }

  getActivityLogs(fromDate?: string, toDate?: string, page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/activity-logs?${params.toString()}`);
  }

  getErrorLogs(fromDate?: string, toDate?: string, page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/error-logs?${params.toString()}`);
  }

  resetPassword(id: number, newPassword: string): Observable<any> {
    // Send newPassword as a raw string body, adding double quotes for JSON parsing
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, `"${newPassword}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
