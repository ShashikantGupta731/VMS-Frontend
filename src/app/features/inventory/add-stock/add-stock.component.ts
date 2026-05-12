import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent],
  templateUrl: './add-stock.component.html',
  styleUrl: './add-stock.component.scss'
})
export class AddStockComponent implements OnInit {
  stockForm: FormGroup;
  items = signal<any[]>([]);
  isSubmitting = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.stockForm = this.fb.group({
      itemId: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      billNo: [''],
      billDate: [''],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.apiService.get<any[]>('/inventory/items').subscribe({
      next: (data) => this.items.set(data),
      error: (err) => console.error('Failed to load items', err)
    });
  }

  onSubmit(): void {
    if (this.stockForm.valid) {
      this.isSubmitting.set(true);
      this.apiService.post('/inventory/add-stock', this.stockForm.value).subscribe({
        next: () => {
          this.toastr.success('Stock added successfully');
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          this.toastr.error('Failed to add stock');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
