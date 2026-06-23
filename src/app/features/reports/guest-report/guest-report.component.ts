import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-guest-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppDataTableComponent,
    AppInputComponent,
    AutoCompleteModule,
    DatePickerModule,
    RouterModule
  ],
  templateUrl: './guest-report.component.html',
  styleUrls: ['./guest-report.component.scss']
})
export class GuestReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  form!: FormGroup;
  
  // Data signals
  allVehicles = signal<any[]>([]);
  filteredVehicles = signal<any[]>([]);
  reportData = signal<any[]>([]);
  today = new Date(); // To restrict future dates
  isLoading = signal(false);

  tableColumns = [
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'totalLitres', label: 'Total Fuel Consumption (Litres)' },
    { key: 'totalAmt', label: 'Total Fuel Consumption Amount (Rs.)' },
    { key: 'maxOdometer', label: 'Odometer Reading' }
  ];

  ngOnInit() {
    this.initForm();
    this.fetchTransportVehicles();
  }

  private initForm() {
    // Default dates from legacy: 2021-04-01 to today
    const fromDate = new Date('2021-04-01');
    const toDate = new Date();

    this.form = this.fb.group({
      selectedVehicle: [null, Validators.required],
      dateFrom: [fromDate, Validators.required],
      dateTo: [toDate, Validators.required]
    });
  }

  private fetchTransportVehicles() {
    this.http.get<any[]>(`${environment.apiUrl}/Reports/guest/transport-vehicles`).subscribe({
      next: (data) => {
        this.allVehicles.set(data || []);
      },
      error: (err) => {
        console.error('Failed to fetch transport vehicles', err);
        this.toastr.error('Failed to load vehicles');
      }
    });
  }

  filterVehicles(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    const filtered = this.allVehicles().filter(v => 
      v.vehiclenumber.toLowerCase().includes(query)
    );
    this.filteredVehicles.set(filtered);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    
    // AutoComplete selected object check
    const vehicleInfoId = val.selectedVehicle?.vehicleinfoid;
    if (!vehicleInfoId) {
      this.toastr.error('Please select a valid vehicle from the dropdown');
      return;
    }

    const request = {
      vehicleInfoId: vehicleInfoId,
      dateFrom: new Date(val.dateFrom).toISOString(),
      dateTo: new Date(val.dateTo).toISOString()
    };

    this.isLoading.set(true);

    this.http.post<any[]>(`${environment.apiUrl}/Reports/guest/records`, request).subscribe({
      next: (data) => {
        this.reportData.set(data || []);
        if (data && data.length === 0) {
          this.toastr.info('No records found for the selected criteria');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch report', err);
        this.toastr.error('Failed to generate report');
        this.isLoading.set(false);
      }
    });
  }
}
