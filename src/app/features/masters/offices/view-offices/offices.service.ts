import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MasterService, Office } from '@core/services/master';

@Injectable({
  providedIn: 'root',
})
export class OfficesService {
  constructor(private masterService: MasterService) { }

  /**
   * Fetches all offices from the real API.
   */
  getOffices(): Observable<Office[]> {
    return this.masterService.getOffices();
  }

  getOfficeById(id: number): Observable<Office> {
    return this.masterService.getOfficeById(id);
  }

  deleteOffice(id: number): Observable<boolean> {
    return new Observable(obs => obs.next(true));
  }
}
