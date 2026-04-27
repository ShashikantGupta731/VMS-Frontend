import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppInputComponent } from '../../shared/components/ui/app-input/input.component';
import { AppPaginationComponent } from '../../shared/components/ui/app-pagination/pagination.component';
import { DesignationsService, Designation } from './designations.service';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
    AppPaginationComponent,
  ],
  templateUrl: './designations.component.html',
  styleUrl: './designations.component.scss',
})
export class DesignationsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private designationsService: DesignationsService
  ) {}

  designations: Designation[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  isLoading = false;
  searchTerm = '';

  searchForm!: FormGroup;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  tableColumns = [
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department' },
    { key: 'fuelLimit', label: 'Fuel Limit' },
    { key: 'maintenanceLimit', label: 'Maintenance Limit' },
    { key: 'designationType', label: 'Designation Type' },
  ];

  ngOnInit(): void {
    this.initializeSearchForm();
    this.setupSearchDebounce();
    this.loadDesignations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
    });

    this.searchForm
      .get('search')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchSubject.next(value);
      });
  }

  setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((searchTerm) => {
          this.searchTerm = searchTerm;
          this.currentPage = 1;
          return this.designationsService.getDesignations(
            this.currentPage,
            this.itemsPerPage,
            searchTerm
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: { data: Designation[]; total: number }) => {
          this.designations = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error searching designations:', error);
          this.isLoading = false;
        },
      });
  }

  loadDesignations(): void {
    this.isLoading = true;
    this.designationsService
      .getDesignations(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe({
        next: (response: { data: Designation[]; total: number }) => {
          this.designations = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading designations:', error);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.isLoading = true;
    this.designationsService
      .getDesignations(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe({
        next: (response: { data: Designation[]; total: number }) => {
          this.designations = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading designations:', error);
          this.isLoading = false;
        },
      });
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
