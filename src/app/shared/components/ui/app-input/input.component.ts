import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

type InputType = 'text' | 'number' | 'date' | 'select' | 'file' | 'password' | 'textarea';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, SelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class AppInputComponent implements ControlValueAccessor, OnInit {
  @Input() type: InputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() maxLength?: number;
  @Input() accept?: string;
  @Input() width?: string = '100%';
  @Input() options?: { label: string; value: any }[] = [];
  @Input() customClass?: string;
  @Input() icon?: string;
  @Input() error?: string;
  @Input() isLoading: boolean = false;

  @Output() change = new EventEmitter<any>();

  value: any = '';
  isSelect = false;

  ngOnInit(): void {
    this.isSelect = this.type === 'select';
  }

  get isTextarea(): boolean {
    return this.type === 'textarea';
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.change.emit(this.value);
  }

  onSelectChange(event: any): void {
    // PrimeNG Select passes the value directly in event.value
    this.value = event.value !== undefined ? event.value : event.target?.value;
    this.onChange(this.value);
    this.change.emit(this.value);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.value = file;
    this.onChange(file);
    this.change.emit(file);
  }

  get inputClass(): string {
    const classes = ['app-input', 'w-100'];

    if (this.isSelect) {
      classes.push('app-select');
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }
}
