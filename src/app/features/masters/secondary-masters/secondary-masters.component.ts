import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericMasterTableComponent } from '@shared/components/ui/generic-master-table/generic-master-table.component';
import { MasterService } from '@core/services/master';
import { TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

interface MasterConfig {
  title: string;
  endpoint: string;
  idField: string;
  columns: TableColumn[];
  fields: { name: string; label: string; type: 'text' | 'number' | 'checkbox' | 'dropdown'; required?: boolean; options?: any[]; optionLabel?: string; optionValue?: string; }[];
}

@Component({
  selector: 'app-secondary-masters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericMasterTableComponent, InputTextModule, InputNumberModule, SelectModule, CheckboxModule],
  providers: [MessageService],
  template: `
    <app-generic-master-table
      #masterTable
      [title]="config.title"
      [subtitle]="'Manage ' + config.title"
      [columns]="config.columns"
      [data]="data"
      [isLoading]="isLoading"
      [isSaving]="isSaving"
      (add)="onAdd()"
      (edit)="onEdit($event)"
      (delete)="onDelete($event)"
      (save)="onSave()">
      
      <form [formGroup]="form" class="p-fluid grid formgrid">
        <div *ngFor="let field of config.fields" class="field col-12 mb-3">
          <label [for]="field.name">{{field.label}} <span *ngIf="field.required" class="text-red-500">*</span></label>
          
          <ng-container [ngSwitch]="field.type">
            <input *ngSwitchCase="'text'" pInputText [id]="field.name" [formControlName]="field.name" />
            <p-inputNumber *ngSwitchCase="'number'" [inputId]="field.name" [formControlName]="field.name"></p-inputNumber>
            
            <p-select *ngSwitchCase="'dropdown'" [options]="field.options!" [formControlName]="field.name" 
                        [optionLabel]="field.optionLabel!" [optionValue]="field.optionValue!" 
                        placeholder="Select {{field.label}}" appendTo="body"></p-select>
                        
            <div *ngSwitchCase="'checkbox'" class="flex align-items-center mt-2">
              <p-checkbox [inputId]="field.name" [formControlName]="field.name" [binary]="true"></p-checkbox>
              <label [for]="field.name" class="ml-2 mb-0">Active / Enabled</label>
            </div>
          </ng-container>
          
          <small class="p-error" *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched">
            {{field.label}} is required.
          </small>
        </div>
      </form>
      
    </app-generic-master-table>
  `
})
export class SecondaryMastersComponent implements OnInit {
  @ViewChild('masterTable') masterTable!: GenericMasterTableComponent;
  
  config!: MasterConfig;
  data: any[] = [];
  form!: FormGroup;
  
  isLoading = false;
  isSaving = false;
  editingId: number | null = null;
  
  private route = inject(ActivatedRoute);
  private masterService = inject(MasterService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.route.data.subscribe(data => {
      const type = data['type'];
      this.initConfig(type);
      this.initForm();
      this.loadData();
    });
  }

  initConfig(type: string) {
    switch(type) {
      case 'departments':
        this.config = {
          title: 'Departments',
          endpoint: 'departments',
          idField: 'deptId',
          columns: [
            { key: 'deptName', label: 'Department Name', sortable: true },
            { key: 'deptAbbre', label: 'Code', sortable: true },
            { key: 'enabled', label: 'Enabled', sortable: true, render: (val) => val ? 'Yes' : 'No' }
          ],
          fields: [
            { name: 'departmentName', label: 'Department Name', type: 'text', required: true },
            { name: 'departmentCode', label: 'Code', type: 'text', required: true },
            { name: 'enabled', label: 'Enabled', type: 'checkbox' }
          ]
        };
        break;
      case 'districts':
        this.config = {
          title: 'Districts',
          endpoint: 'districts',
          idField: 'districtId',
          columns: [
            { key: 'districtName', label: 'District Name', sortable: true }
          ],
          fields: [
            { name: 'districtName', label: 'District Name', type: 'text', required: true },
            { name: 'distAbbre', label: 'Abbreviation', type: 'text' },
            { name: 'isActive', label: 'Active', type: 'checkbox' }
          ]
        };
        break;
      case 'tehsils':
        this.config = {
          title: 'Tehsils',
          endpoint: 'tehsils',
          idField: 'tehsilId', // The generic endpoint might return id or tehsilId, let's assume tehsilId based on standard
          columns: [
            { key: 'tehsilName', label: 'Tehsil Name', sortable: true }
          ],
          fields: [
            { name: 'tehsilName', label: 'Tehsil Name', type: 'text', required: true },
            { name: 'districtId', label: 'District', type: 'dropdown', required: true, options: [], optionLabel: 'name', optionValue: 'id' },
            { name: 'isActive', label: 'Active', type: 'checkbox' }
          ]
        };
        this.loadDistrictsForTehsils();
        break;
      case 'vehicle-types':
        this.config = {
          title: 'Vehicle Types',
          endpoint: 'vehicle-types',
          idField: 'vehicleTypeId', // Assuming vehicleTypeId
          columns: [
            { key: 'vehicleTypeName', label: 'Vehicle Type', sortable: true },
            { key: 'vehicleLifeYears', label: 'Life (Years)', sortable: true },
            { key: 'vehicleLifeKM', label: 'Life (KM)', sortable: true }
          ],
          fields: [
            { name: 'vehicleTypeName', label: 'Type Name', type: 'text', required: true },
            { name: 'vehicleTypeExample', label: 'Example', type: 'text' },
            { name: 'vehicleLifeYears', label: 'Life (Years)', type: 'number', required: true },
            { name: 'vehicleLifeKM', label: 'Life (KM)', type: 'number', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' }
          ]
        };
        break;
      case 'manufacturers':
        this.config = {
          title: 'Manufacturers',
          endpoint: 'manufacturers',
          idField: 'manufacturerId', // Assuming manufacturerId, or id if using DropdownItem
          columns: [
            { key: 'manufacturerName', label: 'Manufacturer Name', sortable: true },
            { key: 'name', label: 'Name', sortable: true } // Fallback for DropdownItem
          ],
          fields: [
            { name: 'manufacturerName', label: 'Manufacturer Name', type: 'text', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' }
          ]
        };
        break;
      case 'office-types':
        this.config = {
          title: 'Office Types',
          endpoint: 'office-types',
          idField: 'officeTypeId', 
          columns: [
            { key: 'officeTypeName', label: 'Office Type Name', sortable: true },
            { key: 'name', label: 'Name', sortable: true } // Fallback
          ],
          fields: [
            { name: 'officeTypeName', label: 'Office Type Name', type: 'text', required: true }
          ]
        };
        break;
      case 'allocations':
        this.config = {
          title: 'Allocations',
          endpoint: 'allocations',
          idField: 'allocationTypeId',
          columns: [
            { key: 'allocationTypeName', label: 'Allocation Type Name', sortable: true }
          ],
          fields: [
            { name: 'allocationTypeName', label: 'Allocation Type Name', type: 'text', required: true }
          ]
        };
        break;
      case 'fleet-strength':
        this.config = {
          title: 'Fleet Strength',
          endpoint: 'fleet-strengths',
          idField: 'fleetStrengthId',
          columns: [
            { key: 'departmentName', label: 'Department Name', sortable: true },
            { key: 'districtName', label: 'District Name', sortable: true },
            { key: 'vehicleTypeName', label: 'Vehicle Type', sortable: true },
            { key: 'fleetStrengthValue', label: 'Strength', sortable: true }
          ],
          fields: [
            { name: 'deptId', label: 'Department', type: 'dropdown', required: true, options: [], optionLabel: 'deptName', optionValue: 'deptId' },
            { name: 'districtId', label: 'District', type: 'dropdown', required: true, options: [], optionLabel: 'name', optionValue: 'id' },
            { name: 'vehicleTypeId', label: 'Vehicle Type', type: 'dropdown', required: true, options: [], optionLabel: 'name', optionValue: 'id' },
            { name: 'fleetStrengthValue', label: 'Strength', type: 'number', required: true }
          ]
        };
        this.loadFleetStrengthLookups();
        break;
      case 'store-items':
        this.config = {
          title: 'Store Items',
          endpoint: 'store-items',
          idField: 'inventoryItemId',
          columns: [
            { key: 'name', label: 'Item Name', sortable: true },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'isModelRequired', label: 'Model Required', sortable: true, render: (val) => val ? 'Yes' : 'No' },
            { key: 'isActive', label: 'Active', sortable: true, render: (val) => val ? 'Yes' : 'No' }
          ],
          fields: [
            { name: 'name', label: 'Item Name', type: 'text', required: true },
            { name: 'category', label: 'Category', type: 'text' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'isModelRequired', label: 'Model Required', type: 'checkbox' },
            { name: 'isActive', label: 'Active', type: 'checkbox' }
          ]
        };
        break;
    }
  }

  initForm() {
    const group: any = {};
    this.config.fields.forEach(f => {
      const validators = f.required ? [Validators.required] : [];
      const defaultValue = f.type === 'checkbox' ? true : null;
      group[f.name] = [defaultValue, validators];
    });
    this.form = this.fb.group(group);
  }

  loadData() {
    this.isLoading = true;
    this.masterService.getGenericMaster(this.config.endpoint).subscribe({
      next: (res: any[]) => {
        this.data = res;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
        this.isLoading = false;
      }
    });
  }

  loadDistrictsForTehsils() {
    this.masterService.getDistricts().subscribe(res => {
      const field = this.config.fields.find(f => f.name === 'districtId');
      if (field) {
        field.options = res;
      }
    });
  }

  loadFleetStrengthLookups() {
    this.masterService.getDepartments().subscribe(res => {
      const field = this.config.fields.find(f => f.name === 'deptId');
      if (field) field.options = res;
    });
    this.masterService.getDistricts().subscribe(res => {
      const field = this.config.fields.find(f => f.name === 'districtId');
      if (field) field.options = res;
    });
    this.masterService.getVehicleTypes().subscribe(res => {
      const field = this.config.fields.find(f => f.name === 'vehicleTypeId');
      if (field) field.options = res;
    });
  }

  onAdd() {
    this.editingId = null;
    this.form.reset();
    
    // Set default values for checkboxes
    this.config.fields.filter(f => f.type === 'checkbox').forEach(f => {
      this.form.get(f.name)?.setValue(true);
    });
  }

  onEdit(row: any) {
    // Determine the ID. Some endpoints return `id` and `name` (DropdownItem), some return specific like `deptId`.
    this.editingId = row[this.config.idField] || row.id;
    
    // Patch form with row data
    // Map 'name' to 'xxxName' if using DropdownItem
    const patchData = { ...row };
    
    // Auto-map generic DropdownItem 'name' back to the specific field name if needed
    if (patchData.name) {
      const nameField = this.config.fields.find(f => f.name.toLowerCase().includes('name'));
      if (nameField && !patchData[nameField.name]) {
        patchData[nameField.name] = patchData.name;
      }
    }

    this.form.patchValue(patchData);
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const data = this.form.value;

    const request$ = this.editingId 
      ? this.masterService.updateGenericMaster(this.config.endpoint, this.editingId, data)
      : this.masterService.saveGenericMaster(this.config.endpoint, data);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved successfully' });
        this.isSaving = false;
        this.masterTable.closeDialog();
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to save' });
        this.isSaving = false;
      }
    });
  }

  onDelete(row: any) {
    const id = row[this.config.idField] || row.id;
    if (confirm('Are you sure you want to delete this record?')) {
      this.masterService.deleteGenericMaster(this.config.endpoint, id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted successfully' });
          this.loadData();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
        }
      });
    }
  }
}
