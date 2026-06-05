import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // BehaviorSubject holds the current state and emits it to new subscribers
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Public observable for components to listen to
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {}

  /**
   * Sets the loading state to true
   */
  show(): void {
    this.isLoadingSubject.next(true);
  }

  /**
   * Sets the loading state to false
   */
  hide(): void {
    this.isLoadingSubject.next(false);
  }
}
