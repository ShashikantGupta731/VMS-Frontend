export interface VehicleDetail {
  id: number;
  registrationNumber: string;
  chassisNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  ddoCode: string;
  officeName: string;
  officeAddress: string;
  designation: string;
  department: string;
  district: string;
  tehsil: string;
  officerName: string;
  currentStatus: string;
  verificationStatus: number;
  vehicleAllocationType: string;
  projectName: string;
  requisitionDeptName: string;
  requisitionOfficeName: string;
  vehicleCost: number | null;
  purchaseDate: string | null;
  manufactureYear: string;
  seatingCapacity: number | null;
  fuelUsed: string;
  driverType: string;
  driverName: string;
  driverContactNumber: string;
  contractorName: string;
  contractorContactNumber: string;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  nodalOfficerMobileNo: string;
  treasuryType: string;
  pDate: string | null;
  readingUptodate: string | null;
  financialYearReading: string;
  kmsCovered: number | null;
  fuelCostLast3Months: number | null;
  fuelLitresLast3Months: number | null;
  maintenanceCostLast3Months: number | null;
  maintenenceDuration: string;
  fitnessUpto: string | null;
  isTyreOriginal: string;
  tyreChangedDate: string | null;
  tyreChangedMeterReading: number | null;
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
  permissionNoc?: string;
  vmsEntryDate?: string;
  fuelConsumptionLitres?: number;
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
