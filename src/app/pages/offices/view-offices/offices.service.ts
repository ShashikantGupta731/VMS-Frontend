import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Office {
  officeName: string;
  officeAddress: string;
  officeAbbreviation: string;
  officeType: string;
  department: string;
  district: string;
  tehsil: string;
}

@Injectable({
  providedIn: 'root',
})
export class OfficesService {
  private mockOffices: Office[] = [
    {
      officeName: 'Regional Transport Office',
      officeAddress: 'Sector 17, Chandigarh',
      officeAbbreviation: 'RTO',
      officeType: 'Government',
      department: 'Transport',
      district: 'Chandigarh',
      tehsil: 'Chandigarh',
    },
    {
      officeName: 'Civil Hospital',
      officeAddress: 'Model Town, Jalandhar',
      officeAbbreviation: 'CH',
      officeType: 'Government',
      department: 'Health',
      district: 'Jalandhar',
      tehsil: 'Jalandhar-I',
    },
    {
      officeName: 'City Police Station',
      officeAddress: 'Main Market, Ludhiana',
      officeAbbreviation: 'CPS',
      officeType: 'Government',
      department: 'Police',
      district: 'Ludhiana',
      tehsil: 'Ludhiana',
    },
    {
      officeName: 'Education Department',
      officeAddress: 'Sector 22, Chandigarh',
      officeAbbreviation: 'EDU',
      officeType: 'Government',
      department: 'Education',
      district: 'Chandigarh',
      tehsil: 'Chandigarh',
    },
    {
      officeName: 'Municipal Corporation',
      officeAddress: 'Civil Lines, Amritsar',
      officeAbbreviation: 'MC',
      officeType: 'Government',
      department: 'Local Bodies',
      district: 'Amritsar',
      tehsil: 'Amritsar-I',
    },
  ];

  constructor() {}

  getOffices(page: number = 1, pageSize: number = 10): Observable<{
    data: Office[];
    total: number;
  }> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = this.mockOffices.slice(startIndex, endIndex);

    return of({
      data: paginatedData,
      total: this.mockOffices.length,
    });
  }

  getOfficeById(id: number): Observable<Office | undefined> {
    const office = this.mockOffices[id];
    return of(office);
  }

  addOffice(office: Office): Observable<Office> {
    this.mockOffices.push(office);
    return of(office);
  }

  updateOffice(id: number, office: Office): Observable<Office> {
    if (id >= 0 && id < this.mockOffices.length) {
      this.mockOffices[id] = office;
      return of(office);
    }
    return of(office);
  }

  deleteOffice(id: number): Observable<boolean> {
    if (id >= 0 && id < this.mockOffices.length) {
      this.mockOffices.splice(id, 1);
      return of(true);
    }
    return of(false);
  }
}
