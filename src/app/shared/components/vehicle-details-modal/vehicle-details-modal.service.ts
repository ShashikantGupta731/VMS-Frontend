import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '@env/environment';
import {
  VehicleDetail,
  FitnessCertificate,
  BillRecord,
  TransferHistory,
} from './vehicle-details-modal.interfaces';

@Injectable({
  providedIn: 'root',
})
export class VehicleDetailsModalService {
  private apiUrl = `${environment.apiUrl}/Vehicles`;

  constructor(private http: HttpClient) {}

  getVehicleDetails(id: string): Observable<VehicleDetail> {
    return this.http.get<VehicleDetail>(`${this.apiUrl}/${id}`);
  }

  getFitnessCertificates(vehicleId: string): Observable<FitnessCertificate[]> {
    return this.http.get<FitnessCertificate[]>(`${this.apiUrl}/${vehicleId}/fitness-certificates`);
  }

  getFuelBills(vehicleId: string): Observable<BillRecord[]> {
    return this.http.get<BillRecord[]>(`${this.apiUrl}/${vehicleId}/fuel-bills`);
  }

  getMaintenanceBills(vehicleId: string): Observable<BillRecord[]> {
    return this.http.get<BillRecord[]>(`${this.apiUrl}/${vehicleId}/maintenance-bills`);
  }

  getServiceBills(vehicleId: string): Observable<BillRecord[]> {
    return this.http.get<BillRecord[]>(`${this.apiUrl}/${vehicleId}/service-bills`);
  }

  getBatteryChanges(vehicleId: string): Observable<BillRecord[]> {
    return this.http.get<BillRecord[]>(`${this.apiUrl}/${vehicleId}/battery-changes`);
  }

  getTyreChanges(vehicleId: string): Observable<BillRecord[]> {
    return this.http.get<BillRecord[]>(`${this.apiUrl}/${vehicleId}/tyre-changes`);
  }

  getTransferHistory(vehicleId: string): Observable<TransferHistory[]> {
    return this.http.get<TransferHistory[]>(`${this.apiUrl}/${vehicleId}/transfer-history`);
  }

  private getMockFitnessCertificates(): FitnessCertificate[] {
    return [
      {
        certificateIssuedDate: '15/01/2024',
        certificateExpiryDate: '14/01/2025',
        certificate: 'fitness_cert_001.pdf',
      },
      {
        certificateIssuedDate: '15/01/2023',
        certificateExpiryDate: '14/01/2024',
        certificate: 'fitness_cert_002.pdf',
      },
    ];
  }

  private getMockFuelBills(): BillRecord[] {
    return [
      {
        recordId: 'FUEL-001',
        claimNumber: 'CLM-2024-001',
        subVoucherNo: 'SV-001',
        date: '20/01/2024',
        type: 'Petrol',
        amount: 5000,
        odometerReading: 15000,
        sanctionOrderNo: 'SO-2024-001',
        sanctionOrderDate: '18/01/2024',
        sanctionAuthority: 'District Collector',
        permissionReceived: 'Yes',
      },
      {
        recordId: 'FUEL-002',
        claimNumber: 'CLM-2024-002',
        subVoucherNo: 'SV-002',
        date: '25/01/2024',
        type: 'Diesel',
        amount: 6000,
        odometerReading: 15500,
        sanctionOrderNo: 'SO-2024-002',
        sanctionOrderDate: '23/01/2024',
        sanctionAuthority: 'District Collector',
      },
    ];
  }

  private getMockMaintenanceBills(): BillRecord[] {
    return [
      {
        recordId: 'MAINT-001',
        claimNumber: 'CLM-2024-003',
        subVoucherNo: 'SV-003',
        date: '10/02/2024',
        type: 'General Service',
        amount: 12000,
        odometerReading: 16000,
        sanctionOrderNo: 'SO-2024-003',
        sanctionOrderDate: '08/02/2024',
        sanctionAuthority: 'District Collector',
        permissionReceived: 'Yes',
      },
    ];
  }

  private getMockServiceBills(): BillRecord[] {
    return [
      {
        recordId: 'SVC-001',
        claimNumber: 'CLM-2024-004',
        subVoucherNo: 'SV-004',
        date: '05/03/2024',
        type: 'Oil Change',
        amount: 3500,
        odometerReading: 17000,
        sanctionOrderNo: 'SO-2024-004',
        sanctionOrderDate: '03/03/2024',
        sanctionAuthority: 'District Collector',
      },
    ];
  }

  private getMockBatteryChanges(): BillRecord[] {
    return [
      {
        recordId: 'BATT-001',
        claimNumber: 'CLM-2024-005',
        subVoucherNo: 'SV-005',
        date: '15/04/2024',
        type: 'Battery Replacement',
        amount: 8000,
        odometerReading: 18000,
        sanctionOrderNo: 'SO-2024-005',
        sanctionOrderDate: '13/04/2024',
        sanctionAuthority: 'District Collector',
        permissionReceived: 'Yes',
      },
    ];
  }

  private getMockTyreChanges(): BillRecord[] {
    return [
      {
        recordId: 'TYRE-001',
        claimNumber: 'CLM-2024-006',
        subVoucherNo: 'SV-006',
        date: '20/05/2024',
        type: 'Tyre Replacement',
        amount: 15000,
        odometerReading: 19000,
        sanctionOrderNo: 'SO-2024-006',
        sanctionOrderDate: '18/05/2024',
        sanctionAuthority: 'District Collector',
      },
    ];
  }

  private getMockTransferHistory(): TransferHistory[] {
    return [
      {
        vehicleTransferredOn: '01/06/2023',
        verifiedOn: '05/06/2023',
        previousOffice: 'Tehsil Office North',
        previousDepartment: 'Revenue Department',
        allocationType: 'Allotted',
        officerName: 'Amit Sharma',
        officerDesignation: 'Tehsildar',
        remarks: 'Transferred to District Collector Office',
        previousDdo: 'DDO-2023-015',
        newDdo: 'DDO-2024-001',
      },
    ];
  }
}
