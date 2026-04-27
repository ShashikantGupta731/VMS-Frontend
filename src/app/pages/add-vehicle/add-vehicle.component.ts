import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppInputComponent } from '../../shared/components/ui/app-input/input.component';
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_TYPE_MANUFACTURERS } from '../../shared/data/vehicle-data';
import { VEHICLE_TYPE_MANUFACTURER_MODELS } from '../../shared/data/vehicle-models-data';
import { VehicleService } from '../../shared/services/vehicle.service';

export interface VehicleFormData {
  purchasedNewVehicle: string;
  officeName: string;
  currentStatus: string;
  vehicleAllocationType: string;
  designation: string;
  officerName: string;
  hrmsCode: string;
  driverType: string;
  driverName: string;
  driverContactNumber: string;
  contractorName: string;
  contractorContactNumber: string;
  department: string;
  vehicleOwnerOffice: string;
  registrationType: string;
  registrationNumber: string;
  manufactureYear: string;
  seatingCapacity: number;
  vehicleType: string;
  manufacturer: string;
  model: string;
  vehiclePhoto: File | null;
  registrationCertificate: File | null;
  chassisNumber: string;
  vehicleCost: number;
  fuelUsed: string;
  purchaseDate: string;
  fitnessUpto: string;
  kmsCovered: number;
  fuelCostLast3Months: number;
  fuelLitresLast3Months: number;
  maintenanceCostLast3Months: number;
  isTyreOriginal: string;
  tyreChangedDate: string;
  tyreChangedMeterReading: number;
}

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss'
})
export class AddVehicleComponent implements OnInit {
  vehicleForm: FormGroup;
  vehiclePhotoFile: File | null = null;
  registrationCertificateFile: File | null = null;

  // Mock dropdown data (short options kept in component)
  offices = ['GENERAL MANAGER PUNJAB ROADWAYS CHANDIGARH'];
  currentStatuses = ['IN USE', 'CONDEMNED', 'NOT IN USE'];
  vehicleAllocationTypes = ['EARMARKED', 'POOL', 'CONTRACTUAL EARMARKED', 'CONTRACTUAL POOLED','REQUISITION EARMARKED','REQUISITION POOLED' ];
  designations = ['Traffic Manager', 'Additional Chief Secretary', 'Additional Director', 'Administration Officer', 'Cabinet Minister', 'Center Flying Squad', 'Chief Minister Punjab', 'Chief Store And Purchase Officer', 'Deputy Director State Transport', 'Director', 'Ex Minister', 'Ex MLA', 'General Manager', 'Head Of Department', 'Leader Of Opposition', 'Mechanical Automobile Engineer', 'MLA', 'MP', 'Officer On Special Duty', 'Person Equivalent To Cabinet Minister', 'Principal Secretary', 'RTA Secretary', 'Secretary Of Administrative Department'];

  // Government officials (bureaucrats) - show HRMS Code
  governmentOfficialDesignations = ['Traffic Manager', 'Additional Chief Secretary', 'Additional Director', 'Administration Officer', 'Center Flying Squad', 'Chief Store And Purchase Officer', 'Deputy Director State Transport', 'Director', 'General Manager', 'Head Of Department', 'Mechanical Automobile Engineer', 'Officer On Special Duty', 'Principal Secretary', 'RTA Secretary', 'Secretary Of Administrative Department'];

  // Seating capacity mapping by vehicle type
  vehicleTypeSeatingCapacity: { [vehicleType: string]: number } = {
    'AMBULANCE': 4,
    'BULLDOZER': 2,
    'COUPE': 2,
    'CRANE': 2,
    'FIRE TRUCK': 4,
    'HATCHBACK': 5,
    'MOTORCYCLE': 2,
    'MUV': 7,
    'SEDAN': 5,
    'SUV': 7,
    'TRUCK': 3,
    'VAN': 8,
    'BUS': 40,
    'JEEP': 5,
    'PICKUP TRUCK': 3,
    'SCOOTER': 2,
    'THREE WHEELER': 3,
    'MINIVAN': 7,
    'CONVERTIBLE': 2,
    'STATION WAGON': 5,
    'CROSSOVER': 5
  };

  // Political positions (ministers/MLAs/MPs) - show Officer Name
  politicalDesignations = ['Cabinet Minister', 'Chief Minister Punjab', 'Ex Minister', 'Ex MLA', 'Leader Of Opposition', 'MLA', 'MP', 'Person Equivalent To Cabinet Minister'];
  officers = ['John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Brown', 'Michael Wilson', 'Sarah Davis'];
  driverTypes = ['REGULAR', 'CONTRACTOR', 'OUTSOURCED','DRIVEN BY NON-DRIVER', 'DAILY WAGES'];
  registrationTypes = ['Permanent', 'Temporary'];
  manufactureYears = this.generateYearRange(1990, new Date().getFullYear());
  departments = ['Transport Department', 'Finance Department', 'Home Department', 'Health Department', 'Education Department', 'Agriculture Department'];
  vehicleOwnerOffices = ['Punjab Roadways', 'PRTC', 'State Transport Authority', 'District Transport Office'];
  
  // Large data imported from shared data files
  vehicleTypes = VEHICLE_TYPES;
  manufacturers = ['Toyota', 'Honda', 'Maruti Suzuki', 'Hyundai', 'Mahindra', 'Tata', 'Ford', 'Chevrolet', 'BMW', 'Audi'];
  fuelTypes = FUEL_TYPES;
  vehicleTypeManufacturers = VEHICLE_TYPE_MANUFACTURERS;
  vehicleTypeManufacturerModels = VEHICLE_TYPE_MANUFACTURER_MODELS;
  yesNoOptions = ['Yes', 'No'];

  // Options format for app-input component

  officeOptions = this.offices.map(office => ({ label: office, value: office }));
  currentStatusOptions = this.currentStatuses.map(status => ({ label: status, value: status }));
  vehicleAllocationTypeOptions = this.vehicleAllocationTypes.map(type => ({ label: type, value: type }));
  designationOptions = this.designations.map(desig => ({ label: desig, value: desig }));
  officerOptions = this.officers.map(officer => ({ label: officer, value: officer }));
  driverTypeOptions = this.driverTypes.map(type => ({ label: type, value: type }));
  registrationTypeOptions = this.registrationTypes.map(type => ({ label: type, value: type }));
  manufactureYearOptions = this.manufactureYears.map(year => ({ label: year.toString(), value: year.toString() }));
  vehicleTypeOptions = this.vehicleTypes.map(type => ({ label: type, value: type }));
  manufacturerOptions = this.manufacturers.map(make => ({ label: make, value: make }));
  fuelTypeOptions = this.fuelTypes.map(fuel => ({ label: fuel, value: fuel }));
  yesNoOptionOptions = this.yesNoOptions.map(option => ({ label: option, value: option }));
  departmentOptions = this.departments.map(dept => ({ label: dept, value: dept }));
  vehicleOwnerOfficeOptions = this.vehicleOwnerOffices.map(office => ({ label: office, value: office }));

  availableModels: string[] = [];
  modelOptions: { label: string; value: string }[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private vehicleService: VehicleService
  ) {
    this.vehicleForm = this.fb.group({
      // Purchase Info
      purchasedNewVehicle: ['Yes', Validators.required],

      // Office & Assignment
      officeName: ['', Validators.required],
      currentStatus: [''],
      vehicleAllocationType: [''],
      designation: [''],
      officerName: [''],
      hrmsCode: [''],
      driverType: [''],
      driverName: [''],
      driverContactNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      contractorName: [''],
      contractorContactNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      department: [''],
      vehicleOwnerOffice: [''],

      // Registration Details
      registrationType: [''],
      registrationNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/)]],
      manufactureYear: [''],
      seatingCapacity: ['', [Validators.min(1), Validators.pattern(/^[0-9]*$/)]],

      // Vehicle Details
      vehicleType: ['', Validators.required],
      manufacturer: ['', Validators.required],
      model: [''],

      // Uploads
      vehiclePhoto: [null],
      registrationCertificate: [null],

      // Technical Details
      chassisNumber: ['', [Validators.pattern(/^[A-Z0-9]{17}$/)]],
      vehicleCost: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      fuelUsed: ['', Validators.required],

      // Dates & Usage
      purchaseDate: [''],
      fitnessUpto: [''],
      kmsCovered: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]],

      // Fuel & Maintenance
      fuelCostLast3Months: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      fuelLitresLast3Months: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      maintenanceCostLast3Months: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]],

      // Tyre Details
      isTyreOriginal: [''],
      tyreChangedDate: [''],
      tyreChangedMeterReading: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]]
    });
  }

  ngOnInit(): void {
    this.setupDynamicBehavior();
    this.setupVehicleTypeManufacturerDependency();
    this.setupManufacturerModelDependency();
    this.setupDesignationDependency();
    this.setupSeatingCapacityDependency();
    this.setupCurrentStatusDependency();
    this.setupVehicleAllocationTypeDependency();
  }

  private setupDynamicBehavior(): void {
    this.vehicleForm.get('purchasedNewVehicle')?.valueChanges.subscribe(value => {
      const purchaseDateControl = this.vehicleForm.get('purchaseDate');
      const vehicleCostControl = this.vehicleForm.get('vehicleCost');

      if (value === 'No') {
        purchaseDateControl?.disable();
        vehicleCostControl?.disable();
        purchaseDateControl?.setValue('');
        vehicleCostControl?.setValue('');
      } else {
        purchaseDateControl?.enable();
        vehicleCostControl?.enable();
      }
    });
  }

  private setupVehicleTypeManufacturerDependency(): void {
    this.vehicleForm.get('vehicleType')?.valueChanges.subscribe(vehicleType => {
      const manufacturerControl = this.vehicleForm.get('manufacturer');
      const modelControl = this.vehicleForm.get('model');

      // Reset manufacturer and model when vehicle type changes
      manufacturerControl?.setValue('');
      modelControl?.setValue('');
      modelControl?.disable();

      if (vehicleType && this.vehicleTypeManufacturers[vehicleType]) {
        const manufacturers = this.vehicleTypeManufacturers[vehicleType];
        this.manufacturerOptions = manufacturers.map(make => ({ label: make, value: make }));
        manufacturerControl?.enable();
      } else {
        this.manufacturerOptions = [];
        manufacturerControl?.disable();
      }
    });

    // Initially disable manufacturer and model
    this.vehicleForm.get('manufacturer')?.disable();
    this.vehicleForm.get('model')?.disable();
  }

  private setupManufacturerModelDependency(): void {
    this.vehicleForm.get('manufacturer')?.valueChanges.subscribe(manufacturer => {
      const modelControl = this.vehicleForm.get('model');
      const vehicleType = this.vehicleForm.get('vehicleType')?.value;

      if (manufacturer && vehicleType && this.vehicleTypeManufacturerModels[vehicleType] && this.vehicleTypeManufacturerModels[vehicleType][manufacturer]) {
        this.availableModels = this.vehicleTypeManufacturerModels[vehicleType][manufacturer];
        this.modelOptions = this.availableModels.map(model => ({ label: model, value: model }));
        modelControl?.enable();
      } else {
        this.availableModels = [];
        this.modelOptions = [];
        modelControl?.setValue('');
        modelControl?.disable();
      }
    });
  }

  private setupDesignationDependency(): void {
    this.vehicleForm.get('designation')?.valueChanges.subscribe(designation => {
      const officerNameControl = this.vehicleForm.get('officerName');
      const hrmsCodeControl = this.vehicleForm.get('hrmsCode');

      // Reset both fields
      officerNameControl?.setValue('');
      hrmsCodeControl?.setValue('');

      if (this.governmentOfficialDesignations.includes(designation)) {
        // Government official - show HRMS Code
        hrmsCodeControl?.enable();
        officerNameControl?.disable();
      } else if (this.politicalDesignations.includes(designation)) {
        // Political position - show Officer Name
        officerNameControl?.enable();
        hrmsCodeControl?.disable();
      } else {
        // No designation selected - disable both
        officerNameControl?.disable();
        hrmsCodeControl?.disable();
      }
    });

    // Initially disable both fields
    this.vehicleForm.get('officerName')?.disable();
    this.vehicleForm.get('hrmsCode')?.disable();
  }

  private setupCurrentStatusDependency(): void {
    this.vehicleForm.get('currentStatus')?.valueChanges.subscribe(status => {
      const driverTypeControl = this.vehicleForm.get('driverType');
      const driverNameControl = this.vehicleForm.get('driverName');
      const driverContactNumberControl = this.vehicleForm.get('driverContactNumber');
      const contractorNameControl = this.vehicleForm.get('contractorName');
      const contractorContactNumberControl = this.vehicleForm.get('contractorContactNumber');
      const departmentControl = this.vehicleForm.get('department');
      const vehicleOwnerOfficeControl = this.vehicleForm.get('vehicleOwnerOffice');

      // Reset all conditional fields
      driverTypeControl?.setValue('');
      driverNameControl?.setValue('');
      driverContactNumberControl?.setValue('');
      contractorNameControl?.setValue('');
      contractorContactNumberControl?.setValue('');
      departmentControl?.setValue('');
      vehicleOwnerOfficeControl?.setValue('');

      if (status === 'IN USE' || status === 'CONDEMNED' || status === 'NOT IN USE') {
        // Enable fields based on vehicle allocation type
        const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
        if (vehicleAllocationType === 'EARMARKED' || vehicleAllocationType === 'POOL') {
          driverTypeControl?.enable();
          driverNameControl?.enable();
          driverContactNumberControl?.enable();
        } else if (vehicleAllocationType === 'CONTRACTUAL EARMARKED' || vehicleAllocationType === 'CONTRACTUAL POOLED') {
          contractorNameControl?.enable();
          contractorContactNumberControl?.enable();
        } else if (vehicleAllocationType === 'REQUISITION EARMARKED' || vehicleAllocationType === 'REQUISITION POOLED') {
          departmentControl?.enable();
          vehicleOwnerOfficeControl?.enable();
        }
      } else {
        // Disable all conditional fields for other statuses
        driverTypeControl?.disable();
        driverNameControl?.disable();
        driverContactNumberControl?.disable();
        contractorNameControl?.disable();
        contractorContactNumberControl?.disable();
        departmentControl?.disable();
        vehicleOwnerOfficeControl?.disable();
      }
    });

    // Initially disable all conditional fields
    this.vehicleForm.get('driverType')?.disable();
    this.vehicleForm.get('driverName')?.disable();
    this.vehicleForm.get('driverContactNumber')?.disable();
    this.vehicleForm.get('contractorName')?.disable();
    this.vehicleForm.get('contractorContactNumber')?.disable();
    this.vehicleForm.get('department')?.disable();
    this.vehicleForm.get('vehicleOwnerOffice')?.disable();
  }

  private setupVehicleAllocationTypeDependency(): void {
    this.vehicleForm.get('vehicleAllocationType')?.valueChanges.subscribe(allocationType => {
      const driverTypeControl = this.vehicleForm.get('driverType');
      const driverNameControl = this.vehicleForm.get('driverName');
      const driverContactNumberControl = this.vehicleForm.get('driverContactNumber');
      const contractorNameControl = this.vehicleForm.get('contractorName');
      const contractorContactNumberControl = this.vehicleForm.get('contractorContactNumber');
      const departmentControl = this.vehicleForm.get('department');
      const vehicleOwnerOfficeControl = this.vehicleForm.get('vehicleOwnerOffice');
      const designationControl = this.vehicleForm.get('designation');
      const officerNameControl = this.vehicleForm.get('officerName');
      const hrmsCodeControl = this.vehicleForm.get('hrmsCode');
      const officeNameControl = this.vehicleForm.get('officeName');

      // Reset all conditional fields
      driverTypeControl?.setValue('');
      driverNameControl?.setValue('');
      driverContactNumberControl?.setValue('');
      contractorNameControl?.setValue('');
      contractorContactNumberControl?.setValue('');
      departmentControl?.setValue('');
      vehicleOwnerOfficeControl?.setValue('');

      // Disable all conditional fields initially
      driverTypeControl?.disable();
      driverNameControl?.disable();
      driverContactNumberControl?.disable();
      contractorNameControl?.disable();
      contractorContactNumberControl?.disable();
      departmentControl?.disable();
      vehicleOwnerOfficeControl?.disable();

      const currentStatus = this.vehicleForm.get('currentStatus')?.value;

      if (currentStatus === 'IN USE' || currentStatus === 'CONDEMNED' || currentStatus === 'NOT IN USE') {
        if (allocationType === 'EARMARKED' || allocationType === 'POOL') {
          // Show driver fields
          driverTypeControl?.enable();
          driverNameControl?.enable();
          driverContactNumberControl?.enable();

          // For Pooled, disable designation and officer name
          if (allocationType === 'POOL') {
            designationControl?.disable();
            officerNameControl?.disable();
          } else {
            designationControl?.enable();
          }
        } else if (allocationType === 'CONTRACTUAL EARMARKED' || allocationType === 'CONTRACTUAL POOLED') {
          // Show contractor fields
          contractorNameControl?.enable();
          contractorContactNumberControl?.enable();

          // For Contractual Pooled or NOT IN USE + CONTRACTUAL POOLED, disable designation and officer name
          if (allocationType === 'CONTRACTUAL POOLED' || (currentStatus === 'NOT IN USE' && allocationType === 'CONTRACTUAL POOLED')) {
            designationControl?.disable();
            officerNameControl?.disable();
            hrmsCodeControl?.disable();
            officeNameControl?.disable();
          } else {
            designationControl?.enable();
          }
        } else if (allocationType === 'REQUISITION EARMARKED' || allocationType === 'REQUISITION POOLED') {
          // Show department and vehicle owner office fields
          departmentControl?.enable();
          vehicleOwnerOfficeControl?.enable();

          // For Requisition Pooled, disable designation and officer name
          if (allocationType === 'REQUISITION POOLED') {
            designationControl?.disable();
            officerNameControl?.disable();
          } else {
            designationControl?.enable();
          }
        }
      }
    });

    // Initially disable all conditional fields
    this.vehicleForm.get('contractorName')?.disable();
    this.vehicleForm.get('contractorContactNumber')?.disable();
    this.vehicleForm.get('department')?.disable();
    this.vehicleForm.get('vehicleOwnerOffice')?.disable();
  }

  // Determine if selected designation is a government official (show HRMS Code) or political position (show Officer Name)
  isGovernmentOfficial(): boolean {
    const designation = this.vehicleForm.get('designation')?.value;
    return this.governmentOfficialDesignations.includes(designation);
  }

  isPoliticalPosition(): boolean {
    const designation = this.vehicleForm.get('designation')?.value;
    return this.politicalDesignations.includes(designation);
  }

  isInUse(): boolean {
    const currentStatus = this.vehicleForm.get('currentStatus')?.value;
    return currentStatus === 'IN USE';
  }

  isCondemned(): boolean {
    const currentStatus = this.vehicleForm.get('currentStatus')?.value;
    return currentStatus === 'CONDEMNED';
  }

  isNotInUse(): boolean {
    const currentStatus = this.vehicleForm.get('currentStatus')?.value;
    return currentStatus === 'NOT IN USE';
  }

  isNotInUseContractualPooled(): boolean {
    const currentStatus = this.vehicleForm.get('currentStatus')?.value;
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return currentStatus === 'NOT IN USE' && vehicleAllocationType === 'CONTRACTUAL POOLED';
  }

  isEarmarked(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'EARMARKED';
  }

  isPooled(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'POOL';
  }

  isContractualEarmarked(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'CONTRACTUAL EARMARKED';
  }

  isContractualPooled(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'CONTRACTUAL POOLED';
  }

  isRequisitionType(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'REQUISITION EARMARKED' || vehicleAllocationType === 'REQUISITION POOLED';
  }

  isRequisitionPooled(): boolean {
    const vehicleAllocationType = this.vehicleForm.get('vehicleAllocationType')?.value;
    return vehicleAllocationType === 'REQUISITION POOLED';
  }

  private setupSeatingCapacityDependency(): void {
    this.vehicleForm.get('vehicleType')?.valueChanges.subscribe(vehicleType => {
      const seatingCapacityControl = this.vehicleForm.get('seatingCapacity');
      if (vehicleType && this.vehicleTypeSeatingCapacity[vehicleType]) {
        seatingCapacityControl?.setValue(this.vehicleTypeSeatingCapacity[vehicleType]);
      } else {
        seatingCapacityControl?.setValue('');
      }
    });
  }

  private generateYearRange(start: number, end: number): string[] {
    const years = [];
    for (let year = end; year >= start; year--) {
      years.push(year.toString());
    }
    return years;
  }

  onVehiclePhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        this.vehiclePhotoFile = file;
        this.vehicleForm.get('vehiclePhoto')?.setValue(file);
      } else {
        input.value = '';
      }
    }
  }

  onRegistrationCertificateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        this.registrationCertificateFile = file;
        this.vehicleForm.get('registrationCertificate')?.setValue(file);
      } else {
        input.value = '';
      }
    }
  }

  private validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only JPG, JPEG, and PNG files are allowed', 'Invalid File Type');
      return false;
    }

    if (file.size > maxSize) {
      this.toastr.error('File size must not exceed 2MB', 'File Too Large');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.markFormGroupTouched(this.vehicleForm);
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    const formValue = this.vehicleForm.value;

    // Add all form fields to FormData
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        // Handle file uploads separately
        if (key === 'vehiclePhoto' || key === 'registrationCertificate') {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    this.vehicleService.createVehicle(formData).subscribe({
      next: (response) => {
        this.toastr.success('Vehicle created successfully!', 'Success');
        this.isSubmitting = false;
        this.router.navigate(['/vehicle']);
      },
      error: (error) => {
        console.error('Error creating vehicle:', error);
        this.toastr.error('Failed to create vehicle. Please try again.', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vehicle']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.vehicleForm.get(controlName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return 'This field is required';
    }
    
    if (errors['email']) {
      return 'Please enter a valid email';
    }
    
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    
    if (errors['pattern']) {
      if (controlName === 'registrationNumber') {
        return 'Invalid registration number format (e.g., MH12AB1234)';
      }
      if (controlName === 'chassisNumber') {
        return 'Invalid chassis number (17 alphanumeric characters)';
      }
      return 'Invalid format';
    }
    
    if (errors['min']) {
      return 'Value must be positive';
    }

    return 'Invalid value';
  }
}
