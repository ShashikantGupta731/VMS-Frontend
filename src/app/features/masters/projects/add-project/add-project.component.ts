import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { MasterService, DropdownItem } from '@core/services/master';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss',
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  projectId: number | null = null;

  departments: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private masterService: MasterService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      departmentId: [null, Validators.required],
      petrolFuelLimit: [0, [Validators.required, Validators.min(0)]],
      petrolMaintenanceLimit: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadDropdownData(): void {
    this.masterService.getDepartments().subscribe((data) => {
      this.departments = data.map(d => ({ label: d.deptName, value: d.deptId }));
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.projectId = +id;
      this.loadProjectData(this.projectId);
    }
  }

  loadProjectData(id: number): void {
    this.isLoading.set(true);
    this.masterService.getProject(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue(project);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Error loading project data');
        this.isLoading.set(false);
        this.router.navigate(['/master/project']);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const projectData = this.projectForm.value;

    if (this.isEditMode() && this.projectId !== null) {
      this.masterService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          this.toastr.success('Project updated successfully');
          this.router.navigate(['/master/project']);
        },
        error: () => {
          this.toastr.error('Error updating project');
          this.isLoading.set(false);
        }
      });
    } else {
      this.masterService.saveProject(projectData).subscribe({
        next: () => {
          this.toastr.success('Project added successfully');
          this.router.navigate(['/master/project']);
        },
        error: () => {
          this.toastr.error('Error adding project');
          this.isLoading.set(false);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/master/project']);
  }
}
