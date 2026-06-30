import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface VehicleSummaryDto {
  totalVehicles: number;
  verifiedVehicles: number;
  unverifiedVehicles: number;
  condemnedVehicles: number;
  activeVehicles: number;
}

export interface BillingSummaryDto {
  pendingBills: number;
  billsReadyForIfms: number;
  totalClaimsThisMonth: number;
  pendingClaimVerifications: number;
}

export interface UserSummaryDto {
  totalUsers: number;
  activeToday: number;
  errorCountToday: number;
}

export interface ActivityDto {
  action: string;
  detail: string;
  timestamp: string;
}

export interface PendingActionDto {
  type: string;
  count: number;
  route: string;
}

export interface DashboardSummaryDto {
  vehicleSummary: VehicleSummaryDto;
  billingSummary: BillingSummaryDto;
  userSummary: UserSummaryDto;
  recentActivity: ActivityDto[];
  pendingActions: PendingActionDto[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  result: T;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getSummary(skipLoader: boolean = false): Observable<ApiResponse<DashboardSummaryDto>> {
    let headers = new HttpHeaders();
    if (skipLoader) {
      headers = headers.set('X-Skip-Loader', 'true');
    }
    return this.http.get<ApiResponse<DashboardSummaryDto>>(`${this.apiUrl}/GetSummary`, { headers });
  }
}
