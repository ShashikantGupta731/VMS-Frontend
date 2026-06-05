import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { OdometerCorrectionService, CorrectableBill } from './odometer-correction.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-odometer-correction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppDataTableComponent
  ],
  providers: [DatePipe],
  templateUrl: './odometer-correction.html',
  styleUrls: ['./odometer-correction.scss']
})
export class OdometerCorrectionComponent implements OnInit {
  bills: CorrectableBill[] = [];
  isLoading = false;
  hasSearched = false;
  searchForm!: FormGroup;

  private odometerService = inject(OdometerCorrectionService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'Record ID', sortable: true },
    { key: 'vehicleNumber', label: 'Vehicle Number', sortable: true },
    { key: 'billNumber', label: 'Bill Number', sortable: true },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true,
      render: (val: any) => val === 1 ? 'Fuel' : 'Maintenance'
    },
    { 
      key: 'billDate', 
      label: 'Date', 
      sortable: true,
      render: (val: any) => this.datePipe.transform(val, 'dd/MM/yyyy') || val
    },
    { key: 'odometerReading', label: 'Odometer', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (val: any) => val !== undefined ? '₹' + Number(val).toLocaleString('en-IN') : '₹0'
    }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Correct Odometer',
      icon: '<i class="pi pi-pencil"></i>',
      action: (row: CorrectableBill) => this.correctOdometer(row)
    }
  ];

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchType: ['claim'],
      searchValue: ['', Validators.required]
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;

    this.isLoading = true;
    this.hasSearched = true;
    const { searchType, searchValue } = this.searchForm.value;

    const val = searchValue.toString().trim();

    const req$ = searchType === 'claim' 
      ? this.odometerService.searchByClaimId(val)
      : this.odometerService.searchByRecordId(Number(val));

    req$.subscribe({
      next: (data) => {
        this.bills = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.toastr.info('No bills found for the provided ID.');
        }
      },
      error: (err) => {
        console.error('Error fetching bills:', err);
        this.toastr.error('Failed to search bills');
        this.isLoading = false;
        this.bills = [];
      }
    });
  }

  clearSearch(): void {
    this.searchForm.reset({ searchType: 'claim' });
    this.bills = [];
    this.hasSearched = false;
  }

  correctOdometer(bill: CorrectableBill): void {
    const formattedDate = this.datePipe.transform(bill.billDate, 'yyyy-MM-dd');
    
    Swal.fire({
      title: 'Correct Odometer & Date',
      html: `
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">New Odometer Reading</label>
          <input type="number" id="swal-odometer" class="form-control" value="${bill.odometerReading}">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">New Bill Date</label>
          <input type="date" id="swal-date" class="form-control" value="${formattedDate}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const odometer = (document.getElementById('swal-odometer') as HTMLInputElement).value;
        const date = (document.getElementById('swal-date') as HTMLInputElement).value;
        if (!odometer || !date) {
          Swal.showValidationMessage('Both fields are required');
          return false;
        }
        return { odometerReading: Number(odometer), billDate: date };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { odometerReading, billDate } = result.value;
        
        Swal.fire({
          title: 'Processing Request!', 
          text: 'Updating odometer details...', 
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.odometerService.updateOdometer(bill.type, bill.id, odometerReading, billDate).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Success', 'Odometer details updated successfully.', 'success');
              this.onSearch(); // Refresh list
            } else {
              Swal.fire('Error', res.message || 'Failed to update details.', 'error');
            }
          },
          error: (err) => {
            console.error('Update error:', err);
            Swal.fire('Error', 'There was a problem updating the bill, try again later.', 'error');
          }
        });
      }
    });
  }
}
