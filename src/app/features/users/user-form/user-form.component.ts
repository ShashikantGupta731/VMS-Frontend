import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { User, UserFormData } from '../user.interfaces';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { ToastrService } from 'ngx-toastr';
import { MasterService, DropdownItem, Department } from '@core/services/master';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent, DialogModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private masterService = inject(MasterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  userForm!: FormGroup;
  isEditMode = signal(false);
  userId = signal<number | null>(null);
  isLoading = signal(false);
  usernameAvailable = signal<boolean | null>(null);
  usernameChecked = signal(false);

  // Master data
  districts = signal<DropdownItem[]>([]);
  departments = signal<DropdownItem[]>([]);
  ddoList = signal<any[]>([]);
  ddoListCopy = signal<any[]>([]);
  selectedDdos = signal<any[]>([]);
  selectedDdoCount = signal(0);
  showDdoModal = signal(false);
  roles = [
    { value: 'SEC', label: 'Secretary Level' },
    { value: 'HOD', label: 'Head of Department Level' },
    { value: 'DCL', label: 'Deputy Commissioner Level' },
    { value: 'DDO', label: 'Data Entry Level' },
    { value: 'ADMN', label: 'Administrator Level' },
    { value: 'NDOF', label: 'Nodal Officer Level' },
    { value: 'PPOF', label: 'Petrol Pump Officer Level' },
    { value: 'ROFC', label: 'Revenue Officer Level' },
    { value: 'FD', label: 'FD Level' }
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadMasterData();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);
      this.userForm.get('username')?.disable();
      this.loadUserDetails(+id);
    }

    // Dynamic field logic based on role
    this.userForm.get('roles')?.valueChanges.subscribe(role => {
      this.updateFieldRequirements(role);
    });
  }

  private passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      password: ['', this.isEditMode() ? [Validators.minLength(6), Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/)] : [Validators.required, Validators.minLength(6), Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/)]],
      confirmPassword: ['', this.isEditMode() ? [] : [Validators.required]],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), Validators.minLength(10), Validators.maxLength(10)]],
      districtId: [''],
      departmentId: [''],
      ddoCode: [''],
      ddoRegistrationNo: [''],
      managedDdos: [''],
      roles: ['', Validators.required],
      isActive: [true],
      isNonTreasuryDDO: [false],
      level: [1] // 1: District Level, 2: State Level
    }, { validators: this.passwordMatchValidator });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  get errorControl(): any {
    return this.userForm.controls;
  }

  private loadMasterData(): void {
    this.masterService.getDistricts().subscribe((data: DropdownItem[]) => this.districts.set(data));
    this.masterService.getDepartments().subscribe((data: Department[]) => {
      const dropdownItems = data.map(d => ({ id: d.deptId, name: d.deptName }));
      this.departments.set(dropdownItems);
    });
  }

  private loadUserDetails(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          districtId: user.districtId,
          departmentId: user.departmentId,
          ddoCode: user.ddoCode,
          ddoRegistrationNo: user.ddoRegistrationNo,
          managedDdos: user.managedDdos,
          roles: user.roles[0] || '',
          isActive: user.isActive,
          isNonTreasuryDDO: user.isNonTreasuryDDO,
          level: (!user.districtId || user.districtId == 0) ? 2 : 1
        });

        // Clear password validators in edit mode
        this.errorControl.password?.clearValidators();
        this.errorControl.password?.updateValueAndValidity();
        this.errorControl.confirmPassword?.clearValidators();
        this.errorControl.confirmPassword?.updateValueAndValidity();

        // Load selected DDOs if applicable
        if (user.managedDdos) {
          try {
            const ddos = JSON.parse(user.managedDdos);
            this.selectedDdos.set(ddos);
            this.selectedDdoCount.set(ddos.length);
          } catch (e) {
            console.error('Failed to parse managed DDOs', e);
          }
        }
        
        this.updateFieldRequirements(user.roles[0] || '');
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load user details');
        this.router.navigate(['/user-management']);
      }
    });
  }

  checkUsernameAvailability(): void {
    if (this.isEditMode() || !this.errorControl.username?.value) return;
    
    const username = this.errorControl.username.value;
    if (username.length < 5) return;
    
    this.userService.checkUsernameAvailability(username).subscribe({
      next: (res) => {
        this.usernameAvailable.set(res.available);
        this.usernameChecked.set(true);
        if (!res.available) {
          this.toastr.warning('Username already exists');
          this.errorControl.username.setErrors({ notAvailable: true });
        }
      },
      error: () => {
        this.toastr.error('Unable to check username availability');
      }
    });
  }

  private updateFieldRequirements(role: string): void {
    const level = this.userForm.get('level')?.value;

    const districtId = this.userForm.get('districtId');
    const departmentId = this.userForm.get('departmentId');
    const ddoCode = this.userForm.get('ddoCode');

    // District requirement
    if (role === 'DDO' || role === 'DCL' || 
       (['NDOF', 'PPOF', 'ROFC'].includes(role) && level == 1)) {
      districtId?.setValidators([Validators.required]);
    } else {
      districtId?.clearValidators();
      if (['ADMN', 'SEC', 'FD', 'HOD'].includes(role) || (['NDOF', 'PPOF', 'ROFC'].includes(role) && level == 2)) {
        districtId?.setValue('');
      }
    }

    // Department requirement
    if (['HOD', 'ROFC', 'PPOF', 'DDO', 'NDOF'].includes(role)) {
      departmentId?.setValidators([Validators.required]);
    } else {
      departmentId?.clearValidators();
      if (['DCL', 'SEC', 'ADMN', 'FD'].includes(role)) {
        departmentId?.setValue('');
      }
    }

    // DDO Code requirement (only for DDO when not non-treasury)
    if (role === 'DDO' && !this.userForm.get('isNonTreasuryDDO')?.value) {
      ddoCode?.setValidators([Validators.required]);
    } else {
      ddoCode?.clearValidators();
    }

    districtId?.updateValueAndValidity();
    departmentId?.updateValueAndValidity();
    ddoCode?.updateValueAndValidity();

    // Fetch DDOs if NDOF/PPOF/ROFC and criteria met
    if (['NDOF', 'PPOF', 'ROFC'].includes(role)) {
      this.fetchDdos();
    }
  }

  fetchDdos(): void {
    const role = this.userForm.get('roles')?.value;
    const level = this.userForm.get('level')?.value;
    const deptId = this.errorControl.departmentId?.value;
    const distId = (level == 1) ? this.errorControl.districtId?.value : 0;

    if (!deptId) return;
    
    this.userService.getDdoList(deptId, distId).subscribe(data => {
      const arr = data.map(d => ({ ...d, selected: this.isDdoSelected(d.id) }));
      this.ddoList.set(arr);
      this.ddoListCopy.set(arr);
    });
  }

  isDdoSelected(id: number): boolean {
    return this.selectedDdos().some(d => d.id === id);
  }

  toggleDdoSelection(i: number): void {
    const currentList = [...this.ddoList()];
    const ddo = currentList[i];
    if (!ddo) return;
    
    ddo.selected = !ddo.selected;
    this.ddoList.set(currentList);
    
    const currentSelected = this.selectedDdos();
    const index = currentSelected.findIndex(d => d.id === ddo.id);
    if (index > -1) {
      this.selectedDdos.set(currentSelected.filter(d => d.id !== ddo.id));
      this.selectedDdoCount.set(this.selectedDdos().length);
    } else {
      this.selectedDdos.set([...currentSelected, { id: ddo.id, ddoCode: ddo.ddoCode }]);
      this.selectedDdoCount.set(this.selectedDdos().length);
    }
    this.userForm.get('managedDdos')?.setValue(JSON.stringify(this.selectedDdos()));
  }

  selectAllDdos(flag: boolean): void {
    if (flag) {
      this.selectedDdos.set(this.ddoList().map(d => ({ id: d.id, ddoCode: d.ddoCode })));
    } else {
      this.selectedDdos.set([]);
    }
    this.selectedDdoCount.set(this.selectedDdos().length);
    this.userForm.get('managedDdos')?.setValue(JSON.stringify(this.selectedDdos()));
    this.ddoList.update(list => list.map(d => ({ ...d, selected: flag })));
  }

  onDdoSearch(event: any): void {
    const searchStr = event.target.value?.toLowerCase() || '';
    if (searchStr.length > 0) {
      this.ddoList.set(this.ddoListCopy().filter(d => d.ddoCode?.toLowerCase().includes(searchStr)));
    } else {
      this.ddoList.set([...this.ddoListCopy()]);
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Validate DDO selection for NDOF/PPOF/ROFC
    const selectedRole = this.errorControl.roles?.value;
    if (['NDOF', 'PPOF', 'ROFC'].includes(selectedRole) && this.selectedDdos().length === 0) {
      this.toastr.warning('Please select at least one DDO');
      return;
    }

    const rawForm = this.userForm.getRawValue();
    
    // Build payload matching UserFormData
    const formData: UserFormData = {
      username: rawForm.username,
      password: rawForm.password || undefined,
      name: `${rawForm.firstName} ${rawForm.middleName || ''} ${rawForm.lastName}`.replace(/\s+/g, ' ').trim(),
      firstName: rawForm.firstName,
      middleName: rawForm.middleName,
      lastName: rawForm.lastName,
      email: rawForm.email,
      phone: rawForm.phone,
      districtId: rawForm.districtId ? +rawForm.districtId : undefined,
      departmentId: rawForm.departmentId ? +rawForm.departmentId : undefined,
      ddoCode: rawForm.ddoCode || '',
      ddoRegistrationNo: rawForm.ddoRegistrationNo || undefined,
      managedDdos: JSON.stringify(this.selectedDdos()),
      isActive: rawForm.isActive === true || rawForm.isActive === 'true',
      isNonTreasuryDDO: rawForm.isNonTreasuryDDO === true || rawForm.isNonTreasuryDDO === 'true',
      roles: [rawForm.roles]
    };

    this.isLoading.set(true);

    const request = this.isEditMode() 
      ? this.userService.updateUser(this.userId()!, formData)
      : this.userService.createUser(formData);

    request.subscribe({
      next: () => {
        this.toastr.success(`User ${this.isEditMode() ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/user-management']);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || err.error?.title || 'An error occurred');
        this.isLoading.set(false);
      }
    });
  }

  isRoleSelected(role: string): boolean {
    return this.userForm.get('roles')?.value === role;
  }

  nullcalling(): void {
    this.userForm.patchValue({
      districtId: '',
      departmentId: '',
      ddoCode: '',
      ddoRegistrationNo: '',
      managedDdos: ''
    });
    this.ddoList.set([]);
    this.ddoListCopy.set([]);
    this.selectedDdos.set([]);
    this.selectedDdoCount.set(0);
  }

  get districtOptions() {
    return this.districts().map(d => ({ label: d.name, value: d.id }));
  }

  get departmentOptions() {
    return this.departments().map(d => ({ label: d.name, value: d.id }));
  }

  get roleOptions() {
    return this.roles;
  }

  get isActiveOptions() {
    return [
      { label: 'No', value: true },
      { label: 'Yes', value: false }
    ];
  }

  get levelOptions() {
    return [
      { label: 'District Level', value: 1 },
      { label: 'State Level', value: 2 }
    ];
  }

  get isNonTreasuryDdoOptions() {
    return [
      { label: 'Yes', value: true },
      { label: 'No', value: false }
    ];
  }

  get passwordError(): string {
    const control = this.userForm.get('password');
    if (!control || !control.touched || !control.invalid) return '';
    let err = '';
    if (control.errors?.['required']) err += 'Password is required. ';
    if (control.errors?.['minlength']) err += 'At least 6 characters. ';
    if (control.errors?.['pattern']) err += 'Must contain uppercase, lowercase, and a digit.';
    return err.trim();
  }

  get confirmPasswordError(): string {
    const control = this.userForm.get('confirmPassword');
    if (!control || !control.touched) return '';
    if (this.userForm.errors?.['mismatch']) {
      return 'Passwords do not match.';
    }
    if (control.invalid && control.errors?.['required']) {
      return 'Confirm password is required.';
    }
    return '';
  }
}
