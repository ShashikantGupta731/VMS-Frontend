import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Designation {
  designation: string;
  department: string;
  fuelLimit: {
    petrol: number;
    diesel: number;
  };
  maintenanceLimit: {
    petrol: number;
    diesel: number;
  };
  designationType: string;
}

@Injectable({
  providedIn: 'root',
})
export class DesignationsService {
  private mockDesignations: Designation[] = [
    {
      designation: 'Driver',
      department: 'Transport',
      fuelLimit: { petrol: 50, diesel: 100 },
      maintenanceLimit: { petrol: 30, diesel: 60 },
      designationType: 'Operational',
    },
    {
      designation: 'Clerk',
      department: 'Transport',
      fuelLimit: { petrol: 30, diesel: 60 },
      maintenanceLimit: { petrol: 20, diesel: 40 },
      designationType: 'Administrative',
    },
    {
      designation: 'Mechanic',
      department: 'Transport',
      fuelLimit: { petrol: 40, diesel: 80 },
      maintenanceLimit: { petrol: 25, diesel: 50 },
      designationType: 'Technical',
    },
    {
      designation: 'Security Officer',
      department: 'Police',
      fuelLimit: { petrol: 60, diesel: 120 },
      maintenanceLimit: { petrol: 40, diesel: 80 },
      designationType: 'Operational',
    },
    {
      designation: 'Medical Officer',
      department: 'Health',
      fuelLimit: { petrol: 45, diesel: 90 },
      maintenanceLimit: { petrol: 30, diesel: 60 },
      designationType: 'Technical',
    },
    {
      designation: 'Teacher',
      department: 'Education',
      fuelLimit: { petrol: 35, diesel: 70 },
      maintenanceLimit: { petrol: 25, diesel: 50 },
      designationType: 'Administrative',
    },
    {
      designation: 'Inspector',
      department: 'Local Bodies',
      fuelLimit: { petrol: 55, diesel: 110 },
      maintenanceLimit: { petrol: 35, diesel: 70 },
      designationType: 'Operational',
    },
    {
      designation: 'Accountant',
      department: 'Finance',
      fuelLimit: { petrol: 30, diesel: 60 },
      maintenanceLimit: { petrol: 20, diesel: 40 },
      designationType: 'Administrative',
    },
  ];

  constructor() {}

  getDesignations(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = ''
  ): Observable<{ data: Designation[]; total: number }> {
    let filteredData = this.mockDesignations;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = this.mockDesignations.filter(
        (item) =>
          item.designation.toLowerCase().includes(lowerSearchTerm) ||
          item.department.toLowerCase().includes(lowerSearchTerm)
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return of({
      data: paginatedData,
      total: filteredData.length,
    });
  }

  getDesignationById(id: number): Observable<Designation | undefined> {
    const designation = this.mockDesignations[id];
    return of(designation);
  }

  addDesignation(designation: Designation): Observable<Designation> {
    this.mockDesignations.push(designation);
    return of(designation);
  }

  updateDesignation(id: number, designation: Designation): Observable<Designation> {
    if (id >= 0 && id < this.mockDesignations.length) {
      this.mockDesignations[id] = designation;
      return of(designation);
    }
    return of(designation);
  }

  deleteDesignation(id: number): Observable<boolean> {
    if (id >= 0 && id < this.mockDesignations.length) {
      this.mockDesignations.splice(id, 1);
      return of(true);
    }
    return of(false);
  }
}
