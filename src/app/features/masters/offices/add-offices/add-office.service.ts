import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterService, DropdownItem, Office } from '@core/services/master';

export interface OfficeFormData {
  deptId: number | null;
  districtId: number | null;
  tehsilId: number | null;
  officeName: string;
  officeAddress: string;
  officeAbbreviation: string;
  officeTypeId: number | null;
  officeTypeOther: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddOfficeService {
  constructor(private masterService: MasterService) {}

  getDepartments(): Observable<DropdownItem[]> {
    // Use the user-filtered endpoint so non-admin users only see their department(s)
    return this.masterService.getDepartmentsByUser().pipe(
      map(depts => depts.map(d => ({ id: d.deptId, name: d.deptName })))
    );
  }

  getDistricts(): Observable<DropdownItem[]> {
    // Non-admin users only see their own district from JWT claims
    return this.masterService.getDistrictsByUser();
  }

  getTehsils(districtId?: number): Observable<DropdownItem[]> {
    // If a district is explicitly provided, load tehsils for that district
    if (districtId) {
      return this.masterService.getTehsils(districtId);
    }
    // Otherwise, load tehsils for the user's own district (legacy behavior)
    return this.masterService.getTehsilsByUser();
  }

  getOfficeTypes(): Observable<DropdownItem[]> {
    return this.masterService.getOfficeTypes();
  }

  saveOffice(formData: OfficeFormData, userId: string): Observable<Office> {
    const payload: Partial<Office> = {
      officeName: formData.officeName,
      officeAddress: formData.officeAddress,
      deptId: formData.deptId ?? 0,
      districtId: formData.districtId ?? 0,
      tehsilId: formData.tehsilId ?? 0,
      officeAbbreviation: formData.officeAbbreviation,
      officeTypeId: formData.officeTypeId ?? 0,
      officeTypeOther: formData.officeTypeOther || '',
      userId: userId
    };
    return this.masterService.saveOffice(payload);
  }

  updateOffice(id: number, formData: OfficeFormData): Observable<Office> {
    const payload: Partial<Office> = {
      officeName: formData.officeName,
      officeAddress: formData.officeAddress,
      deptId: formData.deptId ?? 0,
      districtId: formData.districtId ?? 0,
      tehsilId: formData.tehsilId ?? 0,
      officeAbbreviation: formData.officeAbbreviation,
      officeTypeId: formData.officeTypeId ?? 0,
      officeTypeOther: formData.officeTypeOther || ''
    };
    return this.masterService.updateOffice(id, payload);
  }

  getOfficeById(id: number): Observable<Office> {
    return this.masterService.getOfficeById(id);
  }
}
