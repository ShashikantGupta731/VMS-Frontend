import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

export interface DropdownItem {
    id: number;
    name: string;
}

export interface Department {
    deptId: number;
    deptName: string;
    deptAbbre: string;
    enabled: boolean;
    pDate: string;
    tDate: string;
}

export interface Office {
    id: number;
    officeName: string;
    officeAddress: string;
    deptId: number;
    departmentName: string;
    districtId: number;
    districtName: string;
    tehsilId: number;
    tehsilName?: string;
    officeAbbreviation: string;
    officeTypeId: number;
    officeTypeOther: string;
    userId: string;
    pDate?: string;
    tDate?: string;
    enabled: boolean;
}

export interface Designation {
    designationId: number;
    designationName: string;
    deptId: number;
    departmentName: string;
    designationType: string;
    petrolFuelLimit: number;
    dieselFuelLimit: number;
    petrolMaintenanceLimit: number;
    dieselMaintenanceLimit: number;
}

export interface VehicleModel {
    id: number;
    modelName: string;
    manufacturerName: string;
    seatingCapacity: number;
    vehicleType: string;
    manufacturerId: number;
    vehicleTypeId: number;
    isActive: boolean;
}

export interface Officer {
    id: number;
    officerId: string;
    officerName: string;
    hrmsCode: string;
    deptId: number;
    designationId: number;
    designationType: number;
    designationName?: string;
    fuelLimit: number;
    fuelLimmitd: number;
    maintenanceLimit: number;
    maintenanceLimitd: number;
    remarks: string;
    fileName: string;
    updatedBy: string;
    tDate?: string;
    enabled: boolean;
}

export interface Project {
    id: number;
    name: string;
    departmentId: number;
    petrolFuelLimit: number;
    petrolMaintenanceLimit: number;
}

@Injectable({
    providedIn: 'root',
})
export class MasterService {
    constructor(private api: ApiService) { }

    getDepartments(): Observable<Department[]> {
        return this.api.get<Department[]>('/masters/departments');
    }

    getDepartmentsByUser(): Observable<Department[]> {
        return this.api.get<Department[]>('/masters/departments/by-user');
    }

    getDistricts(): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>('/masters/districts');
    }

    getDistrictsByUser(): Observable<DropdownItem[]> { return this.api.get<DropdownItem[]>('/masters/districts/by-user'); }

    getOffices(departmentId?: number): Observable<Office[]> {
        const endpoint = departmentId ? `/masters/offices?departmentId=${departmentId}` : '/masters/offices';
        return this.api.get<Office[]>(endpoint);
    }

    getOfficeById(id: number): Observable<Office> {
        return this.api.get<Office>(`/masters/offices/${id}`);
    }

    saveOffice(office: Partial<Office>): Observable<Office> {
        return this.api.post<Office>('/masters/offices', office);
    }

    updateOffice(id: number, office: Partial<Office>): Observable<Office> {
        return this.api.put<Office>(`/masters/offices/${id}`, office);
    }

    deleteOffice(id: number): Observable<any> {
        return this.api.delete(`/masters/offices/${id}`);
    }

    getOfficeTypes(): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>('/masters/office-types');
    }

    getTehsils(districtId: number): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>(`/masters/tehsils/${districtId}`);
    }

    getTehsilsByUser(): Observable<DropdownItem[]> { return this.api.get<DropdownItem[]>('/masters/tehsils/by-user'); }

    getDesignations(officeId?: number): Observable<Designation[]> {
        const endpoint = officeId ? `/masters/designations?officeId=${officeId}` : '/masters/designations';
        return this.api.get<Designation[]>(endpoint);
    }

    // NEW: Get designations filtered by logged-in user's department (matching legacy GetDesignationByDeptId)
    getDesignationsByUser(): Observable<Designation[]> {
        return this.api.get<Designation[]>('/masters/designations/by-user');
    }

    getVehicleTypes(): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>('/masters/vehicle-types');
    }

    getManufacturers(): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>('/masters/manufacturers');
    }

    getModels(manufacturerId: number): Observable<DropdownItem[]> {
        return this.api.get<DropdownItem[]>(`/masters/vehicle-models/${manufacturerId}`);
    }

    getAllModels(): Observable<VehicleModel[]> {
        return this.api.get<VehicleModel[]>('/masters/vehicle-models');
    }

    // --- Officers ---
    getOfficers(): Observable<Officer[]> {
        return this.api.get<Officer[]>('/masters/officers');
    }

    getOfficer(id: number): Observable<Officer> {
        return this.api.get<Officer>(`/masters/officers/${id}`);
    }

    saveOfficer(officer: Partial<Officer>): Observable<Officer> {
        return this.api.post<Officer>('/masters/officers', officer);
    }

    updateOfficer(id: number, officer: Partial<Officer>): Observable<Officer> {
        return this.api.put<Officer>(`/masters/officers/${id}`, officer);
    }

    deleteOfficer(id: number): Observable<any> {
        return this.api.delete(`/masters/officers/${id}`);
    }

    verifyHrms(hrmsCode: string): Observable<any> {
        return this.api.get(`/masters/verify-hrms/${hrmsCode}`);
    }

    // --- Projects ---
    getProjects(departmentId?: number): Observable<Project[]> {
        const endpoint = departmentId ? `/masters/projects?departmentId=${departmentId}` : '/masters/projects';
        return this.api.get<Project[]>(endpoint);
    }

    getProject(id: number): Observable<Project> {
        return this.api.get<Project>(`/masters/projects/${id}`);
    }

    saveProject(project: Partial<Project>): Observable<Project> {
        return this.api.post<Project>('/masters/projects', project);
    }

    updateProject(id: number, project: Partial<Project>): Observable<Project> {
        return this.api.put<Project>(`/masters/projects/${id}`, project);
    }

    deleteProject(id: number): Observable<any> {
        return this.api.delete(`/masters/projects/${id}`);
    }
}
