import { Routes } from '@angular/router';
import { Login } from '@features/auth/login/login';
import { Signup } from '@features/auth/signup/signup';
import { VehicleDashboard } from '@features/vehicles/vehicle-dashboard/vehicle-dashboard';
import { AddVehicleComponent } from '@features/vehicles/add-vehicle/add-vehicle.component';
import { TransferVehicleComponent } from '@features/vehicles/transfer-vehicle/transfer-vehicle.component';
import { IfmsClaimsComponent } from '@features/ifms-integration/ifms-claims/ifms-claims.component';
import { NonTreasuryClaimsComponent } from '@features/ifms-integration/non-treasury-claims/non-treasury-claims.component';
import { SendBillsToIfmsComponent } from '@features/ifms-integration/send-bills-ifms/send-bills-to-ifms.component';
import { SendBillsToIfmsProcessComponent } from '@features/ifms-integration/send-bills-ifms-process/send-bills-to-ifms-process.component';
import { ClaimVerificationComponent } from '@features/ifms-integration/claim-verification/claim-verification.component';
import { VerifyVehiclesComponent } from '@features/vehicles/verify-vehicles/verify-vehicles.component';
import { VehicleDetailsComponent } from '@features/vehicles/vehicle-details/vehicle-details.component';
import { UnverifiedVehiclesComponent } from '@features/vehicles/unverified-vehicles/unverified-vehicles.component';
import { FuelVouchersComponent } from '@features/billing-vouchers/bill-voucher/fuel-vouchers/fuel-vouchers.component';
import { BillingDashboardComponent } from '@features/billing-vouchers/billing-dashboard/billing-dashboard.component';
import { ClaimDetailsComponent } from '@features/billing-vouchers/claim-details/claim-details.component';
import { MaintenanceVouchersComponent } from '@features/billing-vouchers/bill-voucher/maintainance-vouchers/maintenance-vouchers.component';
import { HiredVehicleVouchersComponent } from '@features/billing-vouchers/bill-voucher/hired-vehicle-vouchers/hired-vehicle-vouchers.component';
import { ContractualRequisiteVehiclesVouchersComponent } from '@features/billing-vouchers/bill-voucher/Contractual-Requisite-Vehicles-Vouchers/contractual-requisite-vehicles-vouchers.component';
import { MiscellaneousStoreVouchersComponent } from '@features/billing-vouchers/bill-voucher/miscellaneous-store-vouchers/miscellaneous-store-vouchers.component';
import { AddHiredVehicleVoucherComponent } from '@features/billing-vouchers/bill-voucher/addVouchers/addHiredVehicle/add-hired-vehicle-voucher.component';
import { AddFuelVoucherComponent } from '@features/billing-vouchers/bill-voucher/addVouchers/AddFuelVoucher/add-fuel-voucher.component';
import { AddMaintenanceVoucherComponent } from '@features/billing-vouchers/bill-voucher/addVouchers/AddMaintenanceVoucher/add-maintenance-voucher.component';
import { AddContractualVoucherComponent } from '@features/billing-vouchers/bill-voucher/addVouchers/AddContractualVoucher/add-contractual-voucher.component';
import { AddMiscellaneousVoucherComponent } from '@features/billing-vouchers/bill-voucher/addVouchers/AddMiscellaneousVoucher/add-miscellaneous-voucher.component';
import { MainLayout } from './layouts/main-layout/main-layout';
import { OfficesComponent } from '@features/masters/offices/view-offices/offices.component';
import { AddOfficeComponent } from '@features/masters/offices/add-offices/add-office.component';
import { ModelsComponent } from '@features/masters/models/models.component';
import { DesignationsComponent } from '@features/masters/designations/designations.component';
import { ViewOfficersComponent } from '@features/masters/officers/view-officers/officers.component';
import { AddOfficerComponent } from '@features/masters/officers/add-officer/add-officer.component';
import { ViewProjectsComponent } from '@features/masters/projects/view-projects/projects.component';
import { AddProjectComponent } from '@features/masters/projects/add-project/add-project.component';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { AppRole } from './core/config/roles.enum';
import { HomeRedirectComponent } from '@features/home/home-redirect/home-redirect.component';
import { MasterDashboardComponent } from '@features/dashboard/master-dashboard/master-dashboard.component';
import { UserListComponent } from '@features/users/user-list/user-list.component';
import { UserFormComponent } from '@features/users/user-form/user-form.component';
import { UserActivityLogComponent } from '@features/users/user-activity-log/user-activity-log.component';
import { UserErrorLogComponent } from '@features/users/user-error-log/user-error-log.component';
import { InventoryDashboardComponent } from '@features/inventory/inventory-dashboard/inventory-dashboard.component';
import { AddStockComponent } from '@features/inventory/add-stock/add-stock.component';
import { AllotItemComponent } from '@features/inventory/allot-item/allot-item.component';
import { ReportsDashboardComponent } from '@features/reports/reports-dashboard/reports-dashboard.component';
import { ReportViewerComponent } from '@features/reports/report-viewer/report-viewer.component';
import { SecondaryMastersComponent } from '@features/masters/secondary-masters/secondary-masters.component';
import { PpoDashboardComponent } from '@features/ppo/ppo-dashboard/ppo-dashboard.component';
import { AddFillFuelComponent } from '@features/ppo/add-fill-fuel/add-fill-fuel.component';
import { MarkCondemnedComponent } from '@features/vehicles/condemned/mark-condemned/mark-condemned';
import { CondemnedDepositComponent } from '@features/vehicles/condemned/condemned-deposit/condemned-deposit';
import { FdApprovalComponent } from '@features/vehicles/condemned/fd-approval/fd-approval';
import { OdometerCorrectionComponent } from '@features/vehicle/odometer-correction/odometer-correction';
import { UpdateVehicleDetailsComponent } from '@features/vehicle/update-vehicle-details/update-vehicle-details';
export const routes: Routes = [
  { path: '', component: HomeRedirectComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('@features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      // Master Dashboard
      { path: 'dashboard', component: MasterDashboardComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.DeputyCommissioner, AppRole.FD, AppRole.SEC, AppRole.RevenueOfficer])] },

      // Dashboard & Vehicles
      { path: 'vehicle', component: VehicleDashboard, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.DeputyCommissioner, AppRole.FD, AppRole.SEC, AppRole.RevenueOfficer])] },
      { path: 'vehicles/add', component: AddVehicleComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'vehicles/edit/:id', component: AddVehicleComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'vehicles/transfer/:id', component: TransferVehicleComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'verify-vehicles', component: VerifyVehiclesComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'vehicle-details', component: VehicleDetailsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.DeputyCommissioner])] },
      { path: 'vehicles/edit-driver/:id', loadComponent: () => import('./features/vehicles/edit-driver-details/edit-driver-details.component').then(m => m.EditDriverDetailsComponent), canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'vehicle/update-vehicle-details', component: UpdateVehicleDetailsComponent, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'unverified-vehicles', component: UnverifiedVehiclesComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.DeputyCommissioner])] },
      { path: 'vehicles/condemned/mark-condemned', component: MarkCondemnedComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.FD])] },
      { path: 'vehicles/condemned/deposit', component: CondemnedDepositComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.FD])] },
      { path: 'vehicles/condemned/fd-approval', component: FdApprovalComponent, canActivate: [roleGuard([AppRole.FD, AppRole.SEC])] },

      // Admin specific legacy paths
      { path: 'odometer-correction', component: OdometerCorrectionComponent, canActivate: [roleGuard([AppRole.Administrator])] },

      // Inventory Management
      { path: 'inventory', component: InventoryDashboardComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'inventory/add-stock', component: AddStockComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'inventory/allot', component: AllotItemComponent, canActivate: [roleGuard([AppRole.DDO])] },

      // MIS Reports
      { path: 'reports', component: ReportsDashboardComponent, canActivate: [roleGuard([AppRole.SEC, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'reports/view/:reportId', component: ReportViewerComponent, canActivate: [roleGuard([AppRole.SEC, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner, AppRole.FD])] },
      {
        path: 'guest-report',
        canActivate: [roleGuard([AppRole.GUEST])],
        loadComponent: () => import('./features/reports/guest-report/guest-report.component').then(m => m.GuestReportComponent)
      },

      // Billing & Vouchers
      { path: 'bill-voucher', component: BillingDashboardComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'bill-voucher/claim/:id', component: ClaimDetailsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'fuel-claims', component: FuelVouchersComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'maintenance-voucher', component: MaintenanceVouchersComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'hired-vehicle-voucher', component: HiredVehicleVouchersComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'contractual-requisite-vehicle-voucher', component: ContractualRequisiteVehiclesVouchersComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'miscellaneous-store-voucher', component: MiscellaneousStoreVouchersComponent, canActivate: [roleGuard([AppRole.DDO])] },

      // Vouchers Creation
      { path: 'bill-voucher/hired-vehicle/create', component: AddHiredVehicleVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'bill-voucher/create', component: AddFuelVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'bill-voucher/edit/:id', component: AddFuelVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'maintenance-voucher/create', component: AddMaintenanceVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'maintenance-voucher/edit/:id', component: AddMaintenanceVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'contractual-requisite-vehicle-voucher/create', component: AddContractualVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },
      { path: 'miscellaneous-store-voucher/create', component: AddMiscellaneousVoucherComponent, canActivate: [roleGuard([AppRole.DDO])] },

      // IFMS Integration
      { path: 'ifms-claims', component: IfmsClaimsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'non-ifms-claims', component: NonTreasuryClaimsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'bill-integration', component: SendBillsToIfmsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'bill-integration/process-selected-bills', component: SendBillsToIfmsProcessComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'pending-bill-integration', loadComponent: () => import('./features/ifms-integration/pending-bill-integration/pending-bill-integration').then(c => c.PendingBillIntegrationComponent), canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'claim-verification', component: ClaimVerificationComponent, canActivate: [roleGuard([AppRole.NDOF, AppRole.Administrator])] },

      // Masters
      { path: 'master/office', component: OfficesComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'offices/add-office', component: AddOfficeComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'offices/edit/:id', component: AddOfficeComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/officer', component: ViewOfficersComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'master/officer/add', component: AddOfficerComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/officer/edit/:id', component: AddOfficerComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/project', component: ViewProjectsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'master/project/add', component: AddProjectComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/project/edit/:id', component: AddProjectComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'models', component: ModelsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'designations', component: DesignationsComponent, canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/secretaries', loadComponent: () => import('./features/masters/secretaries/secretaries-list/secretaries-list').then(m => m.SecretariesListComponent), canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'master/secretaries/add', loadComponent: () => import('./features/masters/secretaries/add-secretary/add-secretary').then(m => m.AddSecretaryComponent), canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },
      { path: 'master/secretaries/edit/:id', loadComponent: () => import('./features/masters/secretaries/add-secretary/add-secretary').then(m => m.AddSecretaryComponent), canActivate: [roleGuard([AppRole.DDO, AppRole.Administrator])] },

      // Secondary Masters
      { path: 'master/departments', component: SecondaryMastersComponent, data: { type: 'departments' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/districts', component: SecondaryMastersComponent, data: { type: 'districts' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/tehsils', component: SecondaryMastersComponent, data: { type: 'tehsils' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/vehicle-types', component: SecondaryMastersComponent, data: { type: 'vehicle-types' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/manufacturers', component: SecondaryMastersComponent, data: { type: 'manufacturers' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/office-types', component: SecondaryMastersComponent, data: { type: 'office-types' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/allocations', component: SecondaryMastersComponent, data: { type: 'allocations' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/fleet-strength', component: SecondaryMastersComponent, data: { type: 'fleet-strength' }, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'master/store-items', component: SecondaryMastersComponent, data: { type: 'store-items' }, canActivate: [roleGuard([AppRole.Administrator])] },

      // User Management
      { path: 'user-management', component: UserListComponent, canActivate: [roleGuard([AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner, AppRole.SEC])] },
      { path: 'user-management/add', component: UserFormComponent, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'user-management/edit/:id', component: UserFormComponent, canActivate: [roleGuard([AppRole.Administrator, AppRole.HOD, AppRole.DeputyCommissioner])] },
      { path: 'user-management/activity-log', component: UserActivityLogComponent, canActivate: [roleGuard([AppRole.Administrator])] },
      { path: 'user-management/error-log', component: UserErrorLogComponent, canActivate: [roleGuard([AppRole.Administrator])] },

      // Petrol Pump Operator (PPO)
      { path: 'ppo', component: PpoDashboardComponent, canActivate: [roleGuard([AppRole.PetrolPumpOfficer, AppRole.Administrator])] },
      { path: 'ppo/fill-fuel', component: AddFillFuelComponent, canActivate: [roleGuard([AppRole.PetrolPumpOfficer, AppRole.Administrator])] },
    ]
  },
];