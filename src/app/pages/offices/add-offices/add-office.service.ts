import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface OfficePayload {
  department: string;
  tehsil: string;
  officeName: string;
  officeAddress: string;
  officeAbbreviation: string;
  officeType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddOfficeService {
  private departments = [
    { label: 'Transport', value: 'Transport' },
    { label: 'Health', value: 'Health' },
    { label: 'Police', value: 'Police' },
    { label: 'Education', value: 'Education' },
    { label: 'Local Bodies', value: 'Local Bodies' },
  ];

  private tehsils = [
    { label: 'Ludhiana', value: 'Ludhiana' },
    { label: 'Jalandhar', value: 'Jalandhar' },
    { label: 'Amritsar', value: 'Amritsar' },
    { label: 'Chandigarh', value: 'Chandigarh' },
    { label: 'Patiala', value: 'Patiala' },
  ];

  private officeTypes = [
    { label: 'Government', value: 'Government' },
    { label: 'Private', value: 'Private' },
    { label: 'Semi-Government', value: 'Semi-Government' },
  ];

  constructor() {}

  getDepartments(): Observable<{ label: string; value: string }[]> {
    return of(this.departments);
  }

  getTehsils(): Observable<{ label: string; value: string }[]> {
    return of(this.tehsils);
  }

  getOfficeTypes(): Observable<{ label: string; value: string }[]> {
    return of(this.officeTypes);
  }

  saveOffice(office: OfficePayload): Observable<OfficePayload> {
    console.log('Saving office:', office);
    // Mock save operation
    return of(office);
  }

  updateOffice(id: number, office: OfficePayload): Observable<OfficePayload> {
    console.log('Updating office with id:', id, office);
    // Mock update operation
    return of(office);
  }

  getOfficeById(id: number): Observable<OfficePayload | null> {
    // Mock get operation - return null for now
    return of(null);
  }
}
