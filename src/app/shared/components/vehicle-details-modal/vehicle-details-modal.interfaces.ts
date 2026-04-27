export interface VehicleDetail {
  ddoCode: string;
  nodalOfficer: NodalOfficer;
  currentStatus: string;
  treasuryType: string;
  verificationStatus: string;
  office: string;
  officeAddress: string;
  district: string;
  tehsil: string;
  department: string;
  vehicleAllocationType: string;
}

export interface NodalOfficer {
  name: string;
  email: string;
  phone: string;
}

export interface FitnessCertificate {
  certificateIssuedDate: string;
  certificateExpiryDate: string;
  certificate: string;
}

export interface BillRecord {
  recordId: string;
  claimNumber: string;
  subVoucherNo: string;
  date: string;
  type: string;
  amount: number;
  odometerReading: number;
  sanctionOrderNo: string;
  sanctionOrderDate: string;
  sanctionAuthority: string;
  permissionReceived?: string;
}

export interface TransferHistory {
  vehicleTransferredOn: string;
  verifiedOn: string;
  previousOffice: string;
  previousDepartment: string;
  allocationType: string;
  officerName: string;
  officerDesignation: string;
  remarks: string;
  previousDdo: string;
  newDdo: string;
}

export type TabType = 'vehicle-detail' | 'fitness' | 'fuel' | 'maintenance' | 'service' | 'battery' | 'tyres' | 'transfer';
