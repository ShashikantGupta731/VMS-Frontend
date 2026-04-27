import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface VehicleModel {
  modelName: string;
  manufacturer: string;
  seatingCapacity: number;
  vehicleType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModelsService {
  private mockModels: VehicleModel[] = [
    {
      modelName: 'Maruti Suzuki Swift',
      manufacturer: 'Maruti Suzuki',
      seatingCapacity: 5,
      vehicleType: 'Hatchback',
    },
    {
      modelName: 'Honda City',
      manufacturer: 'Honda',
      seatingCapacity: 5,
      vehicleType: 'Sedan',
    },
    {
      modelName: 'Toyota Innova Crysta',
      manufacturer: 'Toyota',
      seatingCapacity: 7,
      vehicleType: 'MPV',
    },
    {
      modelName: 'Hyundai Creta',
      manufacturer: 'Hyundai',
      seatingCapacity: 5,
      vehicleType: 'SUV',
    },
    {
      modelName: 'Tata Nexon',
      manufacturer: 'Tata',
      seatingCapacity: 5,
      vehicleType: 'SUV',
    },
    {
      modelName: 'Mahindra Scorpio',
      manufacturer: 'Mahindra',
      seatingCapacity: 7,
      vehicleType: 'SUV',
    },
    {
      modelName: 'Ford Ecosport',
      manufacturer: 'Ford',
      seatingCapacity: 5,
      vehicleType: 'SUV',
    },
    {
      modelName: 'Kia Seltos',
      manufacturer: 'Kia',
      seatingCapacity: 5,
      vehicleType: 'SUV',
    },
  ];

  constructor() {}

  getModels(page: number = 1, pageSize: number = 10): Observable<{
    data: VehicleModel[];
    total: number;
  }> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = this.mockModels.slice(startIndex, endIndex);

    return of({
      data: paginatedData,
      total: this.mockModels.length,
    });
  }

  getModelById(id: number): Observable<VehicleModel | undefined> {
    const model = this.mockModels[id];
    return of(model);
  }

  addModel(model: VehicleModel): Observable<VehicleModel> {
    this.mockModels.push(model);
    return of(model);
  }

  updateModel(id: number, model: VehicleModel): Observable<VehicleModel> {
    if (id >= 0 && id < this.mockModels.length) {
      this.mockModels[id] = model;
      return of(model);
    }
    return of(model);
  }

  deleteModel(id: number): Observable<boolean> {
    if (id >= 0 && id < this.mockModels.length) {
      this.mockModels.splice(id, 1);
      return of(true);
    }
    return of(false);
  }
}
