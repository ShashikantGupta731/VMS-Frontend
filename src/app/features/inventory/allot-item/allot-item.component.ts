import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-allot-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent],
  templateUrl: './allot-item.component.html',
  styleUrl: './allot-item.component.scss'
})
export class AllotItemComponent implements OnInit {
  allotForm: FormGroup;
  items = signal<any[]>([]);
  vehicles = signal<any[]>([]);
  availableStock = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.allotForm = this.fb.group({
      vehicleId: ['', [Validators.required]],
      itemId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      odometer: [''],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadVehicles();
    
    // Watch for item change to show stock
    this.allotForm.get('itemId')?.valueChanges.subscribe(val => {
      if (val) this.checkStock(val);
      else this.availableStock.set(null);
    });
  }

  loadItems(): void {
    this.apiService.get<any[]>('/inventory/items').subscribe(data => this.items.set(data));
  }

  loadVehicles(): void {
    this.apiService.get<any[]>('/vehicles').subscribe(data => this.vehicles.set(data));
  }

  checkStock(itemId: string): void {
    this.apiService.get<any>(`/inventory/stock-status/${itemId}`).subscribe(data => {
      this.availableStock.set(data.availableStock);
    });
  }

  onSubmit(): void {
    if (this.allotForm.valid) {
      if (this.availableStock() !== null && this.allotForm.value.quantity > this.availableStock()!) {
        this.toastr.error('Insufficient stock available');
        return;
      }

      this.isSubmitting.set(true);
      this.apiService.post('/inventory/allot', this.allotForm.value).subscribe({
        next: () => {
          this.toastr.success('Item allotted successfully');
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to allot item');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
