import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterService, VehicleModel } from '@core/services/master';

@Injectable({
  providedIn: 'root',
})
export class ModelsService {
  constructor(private masterService: MasterService) { }

  getModels(): Observable<VehicleModel[]> {
    return this.masterService.getAllModels();
  }
}
