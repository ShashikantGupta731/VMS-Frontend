import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-generic-master-table',
  standalone: true,
  imports: [CommonModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, DialogModule],
  template: `
    <app-card [title]="title">
      <div header-actions>
        <app-btn label="Add New" icon="pi pi-plus" (onClick)="onAdd()"></app-btn>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="data"
        [actions]="tableActions"
        [isLoading]="isLoading"
        emptyMessage="No records found"
      ></app-data-table>
    </app-card>

    <p-dialog [(visible)]="showDialog" [header]="dialogTitle" [modal]="true" [style]="{width: '450px'}" (onHide)="closeDialog()">
      <!-- We project the custom form from the parent here -->
      <div class="py-4">
        <ng-content></ng-content>
      </div>
      
      <ng-template pTemplate="footer">
        <app-btn label="Cancel" variant="secondary" (onClick)="closeDialog()"></app-btn>
        <app-btn label="Save" variant="primary" (onClick)="onSave()" [loading]="isSaving"></app-btn>
      </ng-template>
    </p-dialog>
  `
})
export class GenericMasterTableComponent {
  @Input() title: string = 'Master';
  @Input() subtitle: string = 'Manage master data';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() isSaving: boolean = false;
  
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() save = new EventEmitter<void>();

  showDialog = false;
  dialogTitle = '';

  tableActions: TableAction[] = [
    {
      label: '',
      icon: 'pi pi-pencil',
      variant: 'primary',
      action: (row) => this.onEdit(row)
    },
    {
      label: '',
      icon: 'pi pi-trash',
      variant: 'danger',
      action: (row) => this.delete.emit(row)
    }
  ];

  onAdd() {
    this.dialogTitle = `Add ${this.title}`;
    this.showDialog = true;
    this.add.emit();
  }

  onEdit(row: any) {
    this.dialogTitle = `Edit ${this.title}`;
    this.showDialog = true;
    this.edit.emit(row);
  }

  closeDialog() {
    this.showDialog = false;
  }

  onSave() {
    this.save.emit();
  }
}
