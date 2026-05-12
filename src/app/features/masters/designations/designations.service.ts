import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterService, Designation } from '@core/services/master';

@Injectable({
  providedIn: 'root',
})
export class DesignationsService {
  constructor(private masterService: MasterService) { }

  getDesignations(): Observable<Designation[]> {
    return this.masterService.getDesignations();
  }
}
