import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '../../../shared/components/ui/app-pagination/pagination.component';
import { OfficesService, Office } from './offices.service';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent],
  templateUrl: './offices.component.html',
  styleUrl: './offices.component.scss',
})
export class OfficesComponent implements OnInit {
  constructor(private router: Router, private officesService: OfficesService) {}

  offices: Office[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  isLoading = false;

  tableColumns = [
    { key: 'officeName', label: 'Office Name' },
    { key: 'officeAddress', label: 'Office Address' },
    { key: 'officeAbbreviation', label: 'Abbreviation' },
    { key: 'officeType', label: 'Office Type' },
    { key: 'department', label: 'Department' },
    { key: 'district', label: 'District' },
    { key: 'tehsil', label: 'Tehsil' },
    { key: 'action', label: 'Action' },
  ];

  ngOnInit(): void {
    this.loadOffices();
  }

  loadOffices(): void {
    this.isLoading = true;
    this.officesService.getOffices(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: { data: Office[]; total: number }) => {
        this.offices = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading offices:', error);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOffices();
  }

  onAddNewOffice(): void {
    this.router.navigate(['/offices/add-office']);
  }

  onEditOffice(office: Office, index: number): void {
    const id = (this.currentPage - 1) * this.itemsPerPage + index;
    this.router.navigate(['/offices/edit', id]);
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
