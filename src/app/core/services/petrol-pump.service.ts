import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStatsDto {
  totalLitresFilled: number;
  totalAmount: number;
  totalVehiclesServed: number;
}

export interface StockAmountDto {
  petrol: number;
  diesel: number;
  mobilOil: number;
  engineOil: number;
  gearOil: number;
  breakOil: number;
}

export interface FuelLogDto {
  vehicleNumber: string;
  litres: number;
  amount: number;
  date: string;
  fuelType: string;
  ddoCode: string;
  officeName: string;
  district: string;
  departmentName: string;
}

export interface FuelEntryRequestDto {
  ddoCode: string;
  vehicleNumber: string;
  inventory: string;
  litres: number;
  amount: number;
  dateAllowance: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  msg?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetrolPumpService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/PetrolPump`;

  getDashboardStats(): Observable<ApiResponse<DashboardStatsDto>> {
    return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.apiUrl}/dashboard-stats`);
  }

  getRecentFuelLogs(): Observable<ApiResponse<FuelLogDto[]>> {
    return this.http.get<ApiResponse<FuelLogDto[]>>(`${this.apiUrl}/logs`);
  }

  getStockAmounts(): Observable<ApiResponse<StockAmountDto>> {
    return this.http.get<ApiResponse<StockAmountDto>>(`${this.apiUrl}/stock`);
  }

  insertFuelEntry(request: FuelEntryRequestDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/entry`, request);
  }

  searchVehicles(query: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/search-vehicles?query=${query}`);
  }
}
