import { Component, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';



import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { AppCardComponent } from '@shared/components/ui/app-card/card.component';

import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';

import { AppInputComponent } from '@shared/components/ui/app-input/input.component';

import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_TYPE_MANUFACTURERS } from '@shared/data/vehicle-data';

import { VEHICLE_TYPE_MANUFACTURER_MODELS } from '@shared/data/vehicle-models-data';

import { VehicleService } from '@shared/services/vehicle.service';

import { MasterService, Designation, Officer } from '@core/services/master';

import { DesignationsService } from '../../masters/designations/designations.service';



export interface CondemnedVehicle {

  id: number;

  registrationNumber: string;

  chassisNumber: string;

}



export interface VehicleFormData {

  purchasedNewVehicle: string;

  fdApproval: File | null;

  vehiclePurchaseType: string;

  otherPurchaseTypeDetails: string;

  newFleetStrength: number;

  fleetStrengthLetter: File | null;

  condemnedVehicleRegNo: string;

  condemnedVehicleChassisNo: string;

  vehicleSource: string;

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

  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent, AppInputComponent],

  templateUrl: './add-vehicle.component.html',

  styleUrl: './add-vehicle.component.scss'

})

export class AddVehicleComponent implements OnInit {

  vehicleForm: FormGroup;

  vehiclePhotoFile: File | null = null;

  registrationCertificateFile: File | null = null;

  fdApprovalFile: File | null = null;

  fleetStrengthLetterFile: File | null = null;

  isEditMode = false;

  vehicleId: number | null = null;

  isSaving = signal(false);



  // Mock dropdown data (short options kept in component)

  offices = ['GENERAL MANAGER PUNJAB ROADWAYS CHANDIGARH'];

  currentStatuses = ['IN USE', 'CONDEMNED', 'NOT IN USE'];

  vehicleAllocationTypes = ['EARMARKED', 'POOL', 'CONTRACTUAL EARMARKED', 'CONTRACTUAL POOLED', 'REQUISITION EARMARKED', 'REQUISITION POOLED', 'PROJECT EARMARKED', 'PROJECT POOLED'];

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

  driverTypes = ['REGULAR', 'CONTRACTOR', 'OUTSOURCED', 'DRIVEN BY NON-DRIVER', 'DAILY WAGES'];

  registrationTypes = ['Permanent', 'Temporary'];

  manufactureYears = this.generateYearRange(1990, new Date().getFullYear());

  departments = ['Transport Department', 'Finance Department', 'Home Department', 'Health Department', 'Education Department', 'Agriculture Department'];

  vehicleOwnerOffices = ['Punjab Roadways', 'PRTC', 'State Transport Authority', 'District Transport Office'];

  vehiclePurchaseTypes = ['Any other Purchase Type', 'Fleet Strength Increased', 'Purchased against Condemned Vehicle'];

  condemnedVehicles: CondemnedVehicle[] = [];
  allOffices: any[] = [];
  allDesignations: Designation[] = [];
  allOfficers: Officer[] = [];
  allVehicleTypes: any[] = [];
  allManufacturers: any[] = [];
  allModels: any[] = [];


  // Large data imported from shared data files (Removing Mocks)

  vehicleTypes: any[] = [];

  manufacturers: any[] = [];

  fuelTypes = FUEL_TYPES;

  yesNoOptions = ['Yes', 'No'];



  // Options format for app-input component

  officeOptions: { label: string; value: string }[] = [];

  currentStatusOptions = this.currentStatuses.map(status => ({ label: status, value: status }));

  vehicleAllocationTypeOptions = this.vehicleAllocationTypes.map(type => ({ label: type, value: type }));

  designationOptions: { label: string; value: string }[] = [];

  officerOptions: { label: string; value: string }[] = [];

  driverTypeOptions = this.driverTypes.map(type => ({ label: type, value: type }));

  registrationTypeOptions = this.registrationTypes.map(type => ({ label: type, value: type }));

  manufactureYearOptions = this.manufactureYears.map(year => ({ label: year.toString(), value: year.toString() }));

  vehicleTypeOptions: { label: string; value: string }[] = [];

  manufacturerOptions: { label: string; value: string }[] = [];

  fuelTypeOptions = this.fuelTypes.map(fuel => ({ label: fuel, value: fuel }));

  yesNoOptionOptions = this.yesNoOptions.map(option => ({ label: option, value: option }));

  departmentOptions: { label: string; value: string }[] = [];

  vehicleOwnerOfficeOptions = this.vehicleOwnerOffices.map(office => ({ label: office, value: office }));

  vehiclePurchaseTypeOptions = this.vehiclePurchaseTypes.map(type => ({ label: type, value: type }));

  condemnedVehicleRegNoOptions: { label: string, value: string }[] = [];



  availableModels: any[] = [];

  modelOptions: { label: string; value: string }[] = [];

  projectOptions: { label: string; value: string }[] = [];

  isSubmitting = signal(false);

  isPurchaseInfoValidated = signal(false);

  constructor(

    private fb: FormBuilder,

    private router: Router,

    private route: ActivatedRoute,

    private toastr: ToastrService,

    private vehicleService: VehicleService,

    private masterService: MasterService,

    private designationsService: DesignationsService

  ) {

    this.vehicleForm = this.fb.group({

      // Purchase Info

      purchasedNewVehicle: ['Yes', Validators.required],

      fdApproval: [null],

      vehiclePurchaseType: [''],

      otherPurchaseTypeDetails: [''],

      newFleetStrength: ['', [Validators.min(1), Validators.pattern(/^[0-9]*$/)]],

      fleetStrengthLetter: [null],

      condemnedVehicleRegNo: [''],

      condemnedVehicleChassisNo: [{ value: '', disabled: true }],

      vehicleSource: ['', [Validators.minLength(40)]],



      // Office & Assignment

      officeName: ['', Validators.required],

      currentStatus: [''],

      vehicleAllocationType: [''],

      designation: [''],

      officerName: [''],

      project: [''],

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

      isTyreOriginal: ['Yes', Validators.required],

      tyreChangedDate: [''],

      tyreChangedMeterReading: ['', [Validators.min(0), Validators.pattern(/^[0-9]*$/)]]

    });

  }



    isVerifyingHrms = signal(false);

  /**
   * Checks if the given designationType string represents an Employee (government official).
   * Handles both legacy integer-as-string format ("1" / "2") and new string format ("Employee" / "Non Employee").
   */
  private isDesignationEmployee(designationType: string): boolean {
    return designationType === 'Employee' || designationType === '1';
  }

  verifyHrms(): void {

    const hrmsCode = this.vehicleForm.get('hrmsCode')?.value;

    if (!hrmsCode) {

      this.toastr.warning('Please enter HRMS Code first', 'Warning');

      return;

    }



    this.isVerifyingHrms.set(true);

    this.masterService.verifyHrms(hrmsCode).subscribe({

      next: (data) => {

        this.isVerifyingHrms.set(false);

        if (data) {

          this.toastr.success('Officer details verified!', 'Success');

          // Auto-populate fields if they exist in the form

          this.vehicleForm.patchValue({

            officerName: data.name,

            designation: data.designation

          });

        }

      },

      error: (err) => {

        this.isVerifyingHrms.set(false);

        this.toastr.error('Officer not found or HRMS service unavailable', 'Error');

      }

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

    this.setupPurchasedNewVehicleDependency();

    this.setupVehiclePurchaseTypeDependency();

    this.setupCondemnedVehicleDependency();
    this.setupTyreDependency();
    this.setupOfficeDependency();
    this.loadAllMasters();

    this.checkEditMode();

  }



  private checkEditMode(): void {

    this.route.params.subscribe(params => {

      if (params['id']) {

        this.isEditMode = true;

        this.vehicleId = +params['id'];

        this.loadVehicleDetails(this.vehicleId);

      }

    });

  }



  private loadVehicleDetails(id: number): void {

    this.vehicleService.getVehicleById(id).subscribe({

      next: (data) => {

        // Map backend response to form names

        this.vehicleForm.patchValue({

          purchasedNewVehicle: data.purchasedNewVehicle || 'Yes',

          vehiclePurchaseType: data.vehiclePurchaseType,

          otherPurchaseTypeDetails: data.otherPurchaseTypeDetails,

          newFleetStrength: data.newFleetStrength,

          condemnedVehicleRegNo: data.condemnedVehicleRegNo,

          condemnedVehicleChassisNo: data.condemnedVehicleChassisNo,

          vehicleSource: data.vehicleSource,

          officeName: data.officeName,

          currentStatus: data.currentStatus,

          vehicleAllocationType: data.vehicleAllocationType,

          designation: data.designation,

          officerName: data.officerName,

          hrmsCode: data.hrmsCode,

          driverType: data.driverType,

          driverName: data.driverName,

          driverContactNumber: data.driverContactNo,

          contractorName: data.contractorName,

          contractorContactNumber: data.contractorContactNo,

          department: data.department,

          registrationNumber: data.registrationNumber,

          manufactureYear: data.manufactureYear?.toString(),

          seatingCapacity: data.seatingCapacity,

          vehicleType: data.vehicleType,

          manufacturer: data.manufacturer,

          model: data.model,

          chassisNumber: data.chassisNumber,

          vehicleCost: data.vehicleCost,

          fuelUsed: data.fuelUsed,

          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null,

          fitnessUpto: data.fitnessUpto ? new Date(data.fitnessUpto).toISOString().split('T')[0] : null

        });



        // Trigger manual updates for dependent dropdowns

        if (data.manufacturer) {

          // The valueChanges subscription in setupManufacturerModelDependency will handle loading model options

          // Small delay to ensure model options are loaded before patching model

          setTimeout(() => {

            this.vehicleForm.patchValue({ model: data.model });

          }, 500);

        }

      },

      error: () => this.toastr.error('Failed to load vehicle details')

    });

  }



    private loadAllMasters(): void {
    // 1. Load Designations by user's department (matching legacy - designations shown on page load)
    this.masterService.getDesignationsByUser().subscribe({
      next: (data) => {
        this.allDesignations = data;
        this.updateDesignationOptionsForAllocation();
      }
    });

    // 2. Load Offices

    this.masterService.getOffices().subscribe({

      next: (data) => {
        this.allOffices = data;
        this.officeOptions = data.map(o => ({ label: o.officeName, value: o.officeName }));

      }

    });



    // 3. Load Departments

    this.masterService.getDepartments().subscribe({

      next: (data) => {

        this.departmentOptions = data.map(d => ({ label: d.deptName, value: d.deptName }));

      }

    });



    // 4. Load Vehicle Types

    this.masterService.getVehicleTypes().subscribe({

      next: (data) => {
        this.allVehicleTypes = data;
        this.vehicleTypeOptions = data.map(v => ({ label: v.name, value: v.name }));

      }

    });



    // 5. Load Manufacturers

    this.masterService.getManufacturers().subscribe({

      next: (data) => {
        this.allManufacturers = data;
        this.manufacturerOptions = data.map(m => ({ label: m.name, value: m.name }));

      }

    });



    // 6. Load Officers (Real Data)

    this.masterService.getOfficers().subscribe({

      next: (data) => {
        
        this.allOfficers = data;

        this.officerOptions = data.map(o => ({ label: o.officerName, value: o.officerName }));

      }

    });



    // 7. Load Projects (Real Data)

    this.masterService.getProjects().subscribe({

      next: (data) => {

        this.projectOptions = data.map(p => ({ label: p.name, value: p.name }));

      }

    });



    // 8. Load Condemned Vehicles (for replacement)

    // Status 2 is 'CONDEMNED' in backend

    this.vehicleService.getVehicles(2).subscribe({

      next: (data: any[]) => {

        this.condemnedVehicles = data.map(v => ({

          id: v.id,

          registrationNumber: v.registrationNumber,

          chassisNumber: v.chassisNumber

        }));

        this.condemnedVehicleRegNoOptions = this.condemnedVehicles.map(v => ({

          label: v.registrationNumber,

          value: v.registrationNumber

        }));

      }

    });

  }



  private setupDynamicBehavior(): void {

    this.vehicleForm.get('purchasedNewVehicle')?.valueChanges.subscribe(value => {

      this.isPurchaseInfoValidated.set(false);

      const purchaseDateControl = this.vehicleForm.get('purchaseDate');

      const vehicleCostControl = this.vehicleForm.get('vehicleCost');



      if (value === 'No') {
        // We only reset the validation state, but keep the fields enabled as per legacy rules
      } else {
        // Keep enabled
      }

    });

  }



  private setupPurchasedNewVehicleDependency(): void {

    this.vehicleForm.get('purchasedNewVehicle')?.valueChanges.subscribe(value => {

      this.isPurchaseInfoValidated.set(false);

      const fdApprovalControl = this.vehicleForm.get('fdApproval');

      const vehiclePurchaseTypeControl = this.vehicleForm.get('vehiclePurchaseType');

      const vehicleSourceControl = this.vehicleForm.get('vehicleSource');



      // Reset all conditional fields

      fdApprovalControl?.setValue(null);

      vehiclePurchaseTypeControl?.setValue('');

      vehicleSourceControl?.setValue('');

      this.resetVehiclePurchaseTypeFields();



      if (value === 'Yes') {

        fdApprovalControl?.enable();

        fdApprovalControl?.setValidators([Validators.required]);

        vehiclePurchaseTypeControl?.enable();

        vehiclePurchaseTypeControl?.setValidators([Validators.required]);

        vehicleSourceControl?.disable();

        vehicleSourceControl?.clearValidators();

        vehicleSourceControl?.updateValueAndValidity();

      } else {

        fdApprovalControl?.disable();

        fdApprovalControl?.clearValidators();

        vehiclePurchaseTypeControl?.disable();

        vehiclePurchaseTypeControl?.clearValidators();

        vehicleSourceControl?.enable();

        vehicleSourceControl?.setValidators([Validators.required, Validators.minLength(30)]);

      }

      fdApprovalControl?.updateValueAndValidity();

      vehiclePurchaseTypeControl?.updateValueAndValidity();

    });



    // Initially disable conditional fields

    this.vehicleForm.get('fdApproval')?.disable();

    this.vehicleForm.get('vehiclePurchaseType')?.disable();

    this.vehicleForm.get('vehicleSource')?.disable();

  }



  private setupVehiclePurchaseTypeDependency(): void {

    this.vehicleForm.get('vehiclePurchaseType')?.valueChanges.subscribe(value => {

      this.resetVehiclePurchaseTypeFields();



      const otherPurchaseTypeDetailsControl = this.vehicleForm.get('otherPurchaseTypeDetails');

      const newFleetStrengthControl = this.vehicleForm.get('newFleetStrength');

      const fleetStrengthLetterControl = this.vehicleForm.get('fleetStrengthLetter');

      const condemnedVehicleRegNoControl = this.vehicleForm.get('condemnedVehicleRegNo');

      const condemnedVehicleChassisNoControl = this.vehicleForm.get('condemnedVehicleChassisNo');



      if (value === 'Any other Purchase Type') {

        otherPurchaseTypeDetailsControl?.enable();

        otherPurchaseTypeDetailsControl?.setValidators([Validators.required]);

        otherPurchaseTypeDetailsControl?.updateValueAndValidity();

      } else if (value === 'Fleet Strength Increased') {

        newFleetStrengthControl?.enable();

        newFleetStrengthControl?.setValidators([Validators.required, Validators.min(1), Validators.pattern(/^[0-9]*$/)]);

        newFleetStrengthControl?.updateValueAndValidity();

        fleetStrengthLetterControl?.enable();

        fleetStrengthLetterControl?.setValidators([Validators.required]);

        fleetStrengthLetterControl?.updateValueAndValidity();

      } else if (value === 'Purchased against Condemned Vehicle') {

        condemnedVehicleRegNoControl?.enable();

        condemnedVehicleRegNoControl?.setValidators([Validators.required]);

        condemnedVehicleRegNoControl?.updateValueAndValidity();

      }

    });



    // Initially disable all conditional fields

    this.vehicleForm.get('otherPurchaseTypeDetails')?.disable();

    this.vehicleForm.get('newFleetStrength')?.disable();

    this.vehicleForm.get('fleetStrengthLetter')?.disable();

    this.vehicleForm.get('condemnedVehicleRegNo')?.disable();

  }



  private setupCondemnedVehicleDependency(): void {

    this.vehicleForm.get('condemnedVehicleRegNo')?.valueChanges.subscribe(value => {

      const condemnedVehicleChassisNoControl = this.vehicleForm.get('condemnedVehicleChassisNo');

      const vehicle = this.condemnedVehicles.find(v => v.registrationNumber === value);



      if (vehicle) {

        condemnedVehicleChassisNoControl?.setValue(vehicle.chassisNumber);

      } else {

        condemnedVehicleChassisNoControl?.setValue('');

      }

    });

  }



  private resetVehiclePurchaseTypeFields(): void {

    const otherPurchaseTypeDetailsControl = this.vehicleForm.get('otherPurchaseTypeDetails');

    const newFleetStrengthControl = this.vehicleForm.get('newFleetStrength');

    const fleetStrengthLetterControl = this.vehicleForm.get('fleetStrengthLetter');

    const condemnedVehicleRegNoControl = this.vehicleForm.get('condemnedVehicleRegNo');

    const condemnedVehicleChassisNoControl = this.vehicleForm.get('condemnedVehicleChassisNo');



    otherPurchaseTypeDetailsControl?.setValue('');

    otherPurchaseTypeDetailsControl?.disable();

    otherPurchaseTypeDetailsControl?.clearValidators();

    otherPurchaseTypeDetailsControl?.updateValueAndValidity();



    newFleetStrengthControl?.setValue('');

    newFleetStrengthControl?.disable();

    newFleetStrengthControl?.clearValidators();

    newFleetStrengthControl?.setValidators([Validators.min(1), Validators.pattern(/^[0-9]*$/)]);

    newFleetStrengthControl?.updateValueAndValidity();



    fleetStrengthLetterControl?.setValue(null);

    fleetStrengthLetterControl?.disable();

    fleetStrengthLetterControl?.clearValidators();

    fleetStrengthLetterControl?.updateValueAndValidity();



    condemnedVehicleRegNoControl?.setValue('');

    condemnedVehicleRegNoControl?.disable();

    condemnedVehicleRegNoControl?.clearValidators();

    condemnedVehicleRegNoControl?.updateValueAndValidity();



    condemnedVehicleChassisNoControl?.setValue('');

  }



  private setupVehicleTypeManufacturerDependency(): void {

    this.vehicleForm.get('vehicleType')?.valueChanges.subscribe(vehicleType => {

      const manufacturerControl = this.vehicleForm.get('manufacturer');

      const modelControl = this.vehicleForm.get('model');



      // Reset manufacturer and model when vehicle type changes

      manufacturerControl?.setValue('');

      modelControl?.setValue('');

      modelControl?.disable();



      if (vehicleType) {

        // Load Manufacturers (Filter by type if backend supports it, otherwise load all)

        this.masterService.getManufacturers().subscribe(data => {

          this.manufacturerOptions = data.map(m => ({ label: m.name, value: m.name }));

          manufacturerControl?.enable();

        });

      } else {

        this.manufacturerOptions = [];

        manufacturerControl?.disable();

      }

    });

  }



  private setupManufacturerModelDependency(): void {

    this.vehicleForm.get('manufacturer')?.valueChanges.subscribe(manufacturerName => {

      const modelControl = this.vehicleForm.get('model');

      const vehicleType = this.vehicleForm.get('vehicleType')?.value;



      if (manufacturerName) {

        // Find Manufacturer ID by name first

        this.masterService.getManufacturers().subscribe(manufacturers => {

          const manufacturer = manufacturers.find(m => m.name === manufacturerName);

          if (manufacturer) {

            this.masterService.getModels(manufacturer.id).subscribe(data => {
              this.allModels = data;
              this.modelOptions = data.map(m => ({ label: m.name, value: m.name }));

              modelControl?.enable();

            });

          }

        });

      } else {

        this.modelOptions = [];

        modelControl?.setValue('');

        modelControl?.disable();

      }

    });

  }



  private updateDesignationOptionsForAllocation(): void {
    // Simply ensure designation options are always populated from allDesignations
    // The HTML template handles enabling/disabling the field based on allocation type
    if (this.allDesignations.length > 0) {
      this.designationOptions = this.allDesignations.map(d => ({ label: d.designationName, value: d.designationName }));
    }
  }

  private setupDesignationDependency(): void {

    this.vehicleForm.get('designation')?.valueChanges.subscribe(designationName => {

      const officerNameControl = this.vehicleForm.get('officerName');

      const hrmsCodeControl = this.vehicleForm.get('hrmsCode');



      // Reset both fields

      officerNameControl?.setValue('');

      hrmsCodeControl?.setValue('');



      const designation = this.allDesignations.find(d => d.designationName === designationName);



            if (designation) {

        // Handle both formats: legacy integer-as-string ("1"/"2") and new string values ("Employee"/"Non Employee")
        const isEmployee = designation.designationType === 'Employee' || designation.designationType === '1';

        if (isEmployee) {

          // Government official - show HRMS Code

          hrmsCodeControl?.enable();

          officerNameControl?.disable();

        } else {

          // Political position or others - show Officer Name

          officerNameControl?.enable();

          hrmsCodeControl?.disable();
          
          // Dynamically filter officers based on selected designation
          const filteredOfficers = this.allOfficers.filter(o => o.designationId === designation.designationId);
          this.officerOptions = filteredOfficers.map(o => ({ label: o.officerName, value: o.officerName }));

        }

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

      // Update designation options when status changes
      this.updateDesignationOptionsForAllocation();

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

        } else if (allocationType === 'PROJECT EARMARKED' || allocationType === 'PROJECT POOLED') {

           // Projects also need designation/officer name

           designationControl?.enable();

        }

      }

      // Ensure designation options are available
      this.updateDesignationOptionsForAllocation();

    });



    // Initially disable all conditional fields

    this.vehicleForm.get('contractorName')?.disable();

    this.vehicleForm.get('contractorContactNumber')?.disable();

    this.vehicleForm.get('department')?.disable();

    this.vehicleForm.get('vehicleOwnerOffice')?.disable();

  }



    // Determine if selected designation is a government official (show HRMS Code) or political position (show Officer Name)

  isGovernmentOfficial(): boolean {

    const designationName = this.vehicleForm.get('designation')?.value;
    const designation = this.allDesignations.find(d => d.designationName === designationName);
    return designation ? this.isDesignationEmployee(designation.designationType) : false;

  }



  isPoliticalPosition(): boolean {

    const designationName = this.vehicleForm.get('designation')?.value;
    const designation = this.allDesignations.find(d => d.designationName === designationName);
    return designation ? !this.isDesignationEmployee(designation.designationType) : false;

  }



  isProjectAllocation(): boolean {

    const allocationType = this.vehicleForm.get('vehicleAllocationType')?.value;

    return allocationType === 'PROJECT EARMARKED' || allocationType === 'PROJECT POOLED';

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



  isPurchasedNewVehicle(): boolean {

    return this.vehicleForm.get('purchasedNewVehicle')?.value === 'Yes';

  }



  isNotPurchasedNewVehicle(): boolean {

    return this.vehicleForm.get('purchasedNewVehicle')?.value === 'No';

  }



  isAnyOtherPurchaseType(): boolean {

    return this.vehicleForm.get('vehiclePurchaseType')?.value === 'Any other Purchase Type';

  }



  isFleetStrengthIncreased(): boolean {

    return this.vehicleForm.get('vehiclePurchaseType')?.value === 'Fleet Strength Increased';

  }



  isPurchasedAgainstCondemned(): boolean {

    return this.vehicleForm.get('vehiclePurchaseType')?.value === 'Purchased against Condemned Vehicle';

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



  onFdApprovalChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const file = input.files[0];

      if (this.validateFileWithPdf(file)) {

        this.fdApprovalFile = file;

        this.vehicleForm.get('fdApproval')?.setValue(file);

      } else {

        input.value = '';

      }

    }

  }



  onFleetStrengthLetterChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const file = input.files[0];

      if (this.validateFileWithPdf(file)) {

        this.fleetStrengthLetterFile = file;

        this.vehicleForm.get('fleetStrengthLetter')?.setValue(file);

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



  private validateFileWithPdf(file: File): boolean {

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    const maxSize = 5 * 1024 * 1024; // 5MB for PDFs



    if (!allowedTypes.includes(file.type)) {

      this.toastr.error('Only JPG, JPEG, PNG, and PDF files are allowed', 'Invalid File Type');

      return false;

    }



    if (file.size > maxSize) {

      this.toastr.error('File size must not exceed 5MB', 'File Too Large');

      return false;

    }



    return true;

  }



  validatePurchaseInfo(): void {
    this.isPurchaseInfoValidated.set(false);

    const purchasedNewVehicle = this.vehicleForm.get('purchasedNewVehicle')?.value;

    if (!purchasedNewVehicle) {
      this.toastr.error('Please select the option: Have You Purchased New Vehicle.', 'Error');
      return;
    }

    if (purchasedNewVehicle === 'No') {
      const vehicleSourceControl = this.vehicleForm.get('vehicleSource');
      if (vehicleSourceControl?.invalid) {
        vehicleSourceControl.markAsTouched();
        if (vehicleSourceControl.hasError('required')) {
          this.toastr.error('Please Update From where you got the Vehicle', 'Error');
        } else if (vehicleSourceControl.hasError('minlength')) {
          this.toastr.error('where you got the Vehicle Minimum character 30', 'Error');
        }
        return;
      }
    } else {
      const fdApprovalControl = this.vehicleForm.get('fdApproval');
      if (fdApprovalControl?.invalid) {
        fdApprovalControl.markAsTouched();
        this.toastr.error('Please upload fd approval document', 'Error');
        return;
      }

      const purchaseType = this.vehicleForm.get('vehiclePurchaseType')?.value;
      if (!purchaseType) {
        this.vehicleForm.get('vehiclePurchaseType')?.markAsTouched();
        this.toastr.error('Please Select Vehicle Purchase Type', 'Error');
        return;
      }

      if (purchaseType === 'Purchased against Condemned Vehicle') {
        const condemnedVehicleRegNoControl = this.vehicleForm.get('condemnedVehicleRegNo');
        if (condemnedVehicleRegNoControl?.invalid) {
          condemnedVehicleRegNoControl.markAsTouched();
          this.toastr.error('Please Select Condemned Vehicle Registration No.', 'Error');
          return;
        }
      } else if (purchaseType === 'Fleet Strength Increased') {
        const newFleetStrengthControl = this.vehicleForm.get('newFleetStrength');
        const fleetStrengthLetterControl = this.vehicleForm.get('fleetStrengthLetter');
        if (newFleetStrengthControl?.invalid || fleetStrengthLetterControl?.invalid) {
          newFleetStrengthControl?.markAsTouched();
          fleetStrengthLetterControl?.markAsTouched();
          this.toastr.error('Please Enter Fleet Strength And Upload Document', 'Error');
          return;
        }
      } else if (purchaseType === 'Any other Purchase Type') {
        const otherPurchaseTypeDetailsControl = this.vehicleForm.get('otherPurchaseTypeDetails');
        if (otherPurchaseTypeDetailsControl?.invalid) {
          otherPurchaseTypeDetailsControl.markAsTouched();
          this.toastr.error('Please Enter Purchase Ression', 'Error'); // legacy typo preserved or fixed 'Reason'
          return;
        }
      }
    }

    this.isPurchaseInfoValidated.set(true);
    this.toastr.success('Purchase Information Validated', 'Success');
  }



  onSubmit(): void {

    if (!this.isEditMode && !this.isPurchaseInfoValidated()) {

      this.toastr.error('Please validate the purchase information first.', 'Validation Required');

      return;

    }



    if (this.vehicleForm.invalid) {

      this.markFormGroupTouched(this.vehicleForm);

      this.toastr.error('Please fill all required fields correctly', 'Validation Error');

      return;

    }



    this.isSubmitting.set(true);



    const formData = new FormData();

    const formValue = this.vehicleForm.getRawValue(); // Use getRawValue to include disabled fields



    // Add all form fields to FormData

    // Map form values to the new synchronized API keys (Legacy Parity with PascalCase)
    const payload: any = {
      VehicleNumber: formValue.registrationNumber,
      OfficeId: this.allOffices.find(o => o.officeName === formValue.officeName)?.id || 0,
      OfficerName: formValue.officerName || '',
      DesignationId: this.allDesignations.find(d => d.designationName === formValue.designation)?.designationId || null,
      ManufacturerId: this.allManufacturers.find(m => m.name === formValue.manufacturer)?.id || 0,
      ModelId: this.allModels.find(m => m.name === formValue.model)?.id || 0,
      ManufactureYear: formValue.manufactureYear ? formValue.manufactureYear.toString() : '',
      VehicleTypeId: this.allVehicleTypes.find(v => v.name === formValue.vehicleType)?.id || 0,
      SeatingCapacity: formValue.seatingCapacity ? +formValue.seatingCapacity : 0,
      FuelUsed: formValue.fuelUsed,
      FitnessUpto: formValue.fitnessUpto || null,
      CurrentStatus: formValue.currentStatus,
      ChassisNumber: formValue.chassisNumber,
      Ishaveyoupurchasednewvehicle: formValue.purchasedNewVehicle === 'Yes',
      IsTyreOriginal: formValue.isTyreOriginal === 'Yes',
      TyreChangedDate: formValue.tyreChangedDate || null,
      TyreChangedMeterReading: formValue.tyreChangedMeterReading ? +formValue.tyreChangedMeterReading : null,
      KM30062017: formValue.kmsCovered ? +formValue.kmsCovered : null,
      FuelConsumptionCost: formValue.fuelCostLast3Months ? +formValue.fuelCostLast3Months : null,
      FuelConsumptionLitres: formValue.fuelLitresLast3Months ? +formValue.fuelLitresLast3Months : null,
      VehicleAllocationType: formValue.vehicleAllocationType,
      VehicleCost: formValue.vehicleCost ? +formValue.vehicleCost : null,
      PurchaseDate: formValue.purchaseDate || null,
      Last3YearsMaintenanceCost: formValue.maintenanceCostLast3Months ? +formValue.maintenanceCostLast3Months : null,
      DriverType: formValue.driverType,
      DriverName: formValue.driverName,
      DriverContactNo: formValue.driverContactNumber,
      ContractorName: formValue.contractorName,
      ContractorContactNo: formValue.contractorContactNumber,
      HRMSCode: formValue.hrmsCode,
      OfficerId: this.allOfficers.find(o => o.officerName === formValue.officerName)?.id || null,
      VehiclePurchaseType: formValue.vehiclePurchaseType || '',
      Remarks: formValue.purchasedNewVehicle === 'No' ? formValue.vehicleSource : 
               (formValue.vehiclePurchaseType === 'Fleet Strength Increased' ? formValue.newFleetStrength?.toString() : 
               formValue.otherPurchaseTypeDetails),
      CondemnedVehicleRegNo: formValue.condemnedVehicleRegNo || '',
      CondemnedVehicleChassisNo: formValue.condemnedVehicleChassisNo || ''
    };

    // Add everything to FormData
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key].toString());
      }
    });

    // Handle files separately with correct DTO property names
    if (this.vehiclePhotoFile) formData.append('VehiclePhoto', this.vehiclePhotoFile);
    if (this.registrationCertificateFile) formData.append('RegistrationCertificate', this.registrationCertificateFile);
    if (this.fdApprovalFile) formData.append('FdApprovalFile', this.fdApprovalFile);
    if (this.fleetStrengthLetterFile) formData.append('FleetStrengthLetterFile', this.fleetStrengthLetterFile);




    const action = this.isEditMode && this.vehicleId

      ? this.vehicleService.updateVehicle(this.vehicleId, formData)

      : this.vehicleService.createVehicle(formData);



    action.subscribe({

      next: (response) => {

        const msg = this.isEditMode ? 'Vehicle updated successfully!' : 'Vehicle created successfully!';

        this.toastr.success(msg, 'Success');

        this.isSubmitting.set(false);

        this.router.navigate(['/vehicle']);

      },

      error: (error) => {

        console.error('Error creating vehicle:', error);

        this.toastr.error('Failed to create vehicle. Please try again.', 'Error');

        this.isSubmitting.set(false);

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

      if (controlName === 'vehicleSource') {

        return 'Minimum 30 characters required';

      }

      return `Minimum length is ${errors['minlength'].requiredLength} characters`;

    }



    if (errors['pattern']) {

      if (controlName === 'registrationNumber') {

        return 'Invalid registration number format (e.g., MH12AB1234)';

      }

      if (controlName === 'chassisNumber') {

        return 'Invalid chassis number (17 alphanumeric characters)';

      }

      if (controlName === 'newFleetStrength') {

        return 'Please enter a valid number';

      }

      return 'Invalid format';

    }



    if (errors['min']) {

      return 'Value must be positive';

    }



    return 'Invalid value';

  }

    private setupOfficeDependency(): void {
    this.vehicleForm.get('officeName')?.valueChanges.subscribe(officeName => {
      const office = this.allOffices.find(o => o.officeName === officeName);
      if (office) {
        // Designations are already loaded on page load by getUserDepartments().
        // When office changes, we keep the same designations (filtered by user's department)
        // to match legacy behavior. Reset selected designation when office changes.
        this.vehicleForm.get('designation')?.setValue('');
      } else {
        // Keep existing designations loaded on page load (don't clear them)
        this.vehicleForm.get('designation')?.setValue('');
      }
    });
  }

  private getFinancialYear(): string {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed, 3 is April
    
    // Financial year starts from April (month 3)
    let startYear, endYear;
    if (currentMonth >= 3) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }
    
    return `${startYear}-${endYear.toString().substring(2)}`;
  }

  private setupTyreDependency(): void {
    this.vehicleForm.get('isTyreOriginal')?.valueChanges.subscribe(value => {
      const tyreDateControl = this.vehicleForm.get('tyreChangedDate');
      const tyreKmControl = this.vehicleForm.get('tyreChangedMeterReading');

      if (value === 'Yes') {
        tyreDateControl?.disable();
        tyreKmControl?.disable();
        tyreDateControl?.setValue('');
        tyreKmControl?.setValue('');
      } else {
        tyreDateControl?.enable();
        tyreKmControl?.enable();
      }
    });

    // Initial state: If 'Yes', disable the fields
    if (this.vehicleForm.get('isTyreOriginal')?.value === 'Yes') {
      this.vehicleForm.get('tyreChangedDate')?.disable();
      this.vehicleForm.get('tyreChangedMeterReading')?.disable();
    }
  }
}

