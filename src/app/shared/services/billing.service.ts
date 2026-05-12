import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum BillType {
  Fuel = 1,
  Maintenance = 2,
  Hired = 3,
  Contractual = 4
}

export enum BillStatus {
  Draft = 0,
  Pending = 1,
  Verified = 2,
  Rejected = 3
}

export interface FuelVoucher {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  billNumber: string;
  billDate: string;
  odometerReading: number;
  fuelQuantity: number;
  amount: number;
  status: number;
}

export interface MaintenanceBill {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  billNumber: string;
  billDate: string;
  odometerReading: number;
  amount: number;
  maintenanceType: string;
  details: string;
  status: number;
}

export interface HiredVehicleBill {
  id: number;
  billNumber: string;
  billDate: string;
  vehicleNumber: string;
  officeName: string;
  contractorName: string;
  contractorPhone: string;
  vehicleType: string;
  noOfVehicles: number;
  hiredFrom: string;
  hiredTo: string;
  kmCovered: number;
  amount: number;
  status: number;
}

export interface ContractualBill {
  id: number;
  billNumber: string;
  billDate: string;
  billPeriodFrom: string;
  billPeriodTo: string;
  ddoCode: string;
  vehicleNumber: string;
  amount: number;
  status: number;
}

export interface BillClaim {
  id: number;
  claimNumber: string;
  totalAmount: number;
  status: BillStatus;
  type: BillType;
  createdBy: string;
  createdAt: string;
  comments?: string;
}

export interface BillClaimDetail extends BillClaim {
  forwardedToTreasury: boolean;
  subVoucherNo?: string;
  subVoucherDescription?: string;
  sanctionOrderNo?: string;
  sanctionOrderDate?: string;
  sanctionAuthority?: string;
  firmName?: string;
  tax: number;
  fuelBills?: FuelVoucher[];
  maintenanceBills?: MaintenanceBill[];
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private api = inject(ApiService);

  // --- Bills (Drafts) ---
  getDrafts(type: BillType): Observable<any[]> {
    const endpoint = this.getEndpointByType(type);
    return this.api.get<{ success: boolean, result: any[] }>(`Billing/${endpoint}`).pipe(
      map(res => res.result)
    );
  }

  saveBill(type: BillType, data: any): Observable<any> {
    const endpoint = this.getEndpointByType(type);
    return this.api.post(`Billing/${endpoint}`, data);
  }

  deleteBill(type: BillType, id: number): Observable<boolean> {
    const endpoint = this.getEndpointByType(type);
    return this.api.delete<{ success: boolean }>(`Billing/${endpoint}/${id}`).pipe(
      map(res => res.success)
    );
  }

  // --- Claims ---
  getClaims(): Observable<BillClaim[]> {
    return this.api.get<{ success: boolean, result: BillClaim[] }>('Billing/claims').pipe(
      map(res => res.result)
    );
  }

  getClaimDetails(id: number): Observable<BillClaimDetail> {
    return this.api.get<{ success: boolean, result: BillClaimDetail }>(`Billing/claims/${id}`).pipe(
      map(res => res.result)
    );
  }

  createClaim(payload: any): Observable<any> {
    return this.api.post('Billing/claims', payload);
  }

  verifyClaim(id: number, comments?: string): Observable<boolean> {
    return this.api.post<{ success: boolean }>(`Billing/claims/${id}/verify`, comments).pipe(
      map(res => res.success)
    );
  }

  rejectClaim(id: number, comments: string): Observable<boolean> {
    return this.api.post<{ success: boolean }>(`Billing/claims/${id}/reject`, comments).pipe(
      map(res => res.success)
    );
  }

  // --- Helpers ---
  getOdometerValidation(vehicleId: number, billDate: string): Observable<any> {
    return this.api.get(`Billing/validate-odometer/${vehicleId}?billDate=${billDate}`).pipe(
      map((res: any) => res.result)
    );
  }

  checkFitness(vehicleId: number, odometer: number): Observable<boolean> {
    return this.api.get<{ success: boolean, required: boolean }>(`Billing/check-fitness/${vehicleId}?odometer=${odometer}`).pipe(
      map(res => res.required)
    );
  }

  checkPermission(vehicleId: number, type: BillType, value: number): Observable<boolean> {
    return this.api.get<{ success: boolean, required: boolean }>(`Billing/check-permission/${vehicleId}?type=${type}&value=${value}`).pipe(
      map(res => res.required)
    );
  }

  getDdoVehicles(): Observable<any[]> {
    return this.api.get<{ success: boolean, result: any[] }>('Billing/vehicles').pipe(
      map(res => res.result)
    );
  }

  private getEndpointByType(type: BillType): string {
    switch (type) {
      case BillType.Fuel: return 'fuel';
      case BillType.Maintenance: return 'maintenance';
      case BillType.Hired: return 'hired';
      case BillType.Contractual: return 'contractual';
      default: return 'fuel';
    }
  }
}
