import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:5261/api/vehicles';

  constructor(private http: HttpClient) {}

  createVehicle(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  getVehicles(status?: number): Observable<any[]> {
    let url = this.apiUrl;
    if (status !== undefined) {
      url += `?status=${status}`;
    }
    return this.http.get<any[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getVehicleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateVehicle(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  transferVehicle(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, formData).pipe(
      catchError(this.handleError)
    );
  }

  condemnVehicle(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/condemn`, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
