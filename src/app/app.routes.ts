import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { AddVehicleComponent } from './pages/add-vehicle/add-vehicle.component';
import { IfmsClaimsComponent } from './pages/ifms-claims/ifms-claims.component';
import { NonTreasuryClaimsComponent } from './pages/non-treasury-claims/non-treasury-claims.component';
import { SendBillsToIfmsComponent } from './pages/send-bills-ifms/send-bills-to-ifms.component';
import { VerifyVehiclesComponent } from './pages/verify-vehicles/verify-vehicles.component';
import { VehicleDetailsComponent } from './pages/vehicle-details/vehicle-details.component';
import { FuelVouchersComponent } from './pages/bill-voucher/fuel-vouchers/fuel-vouchers.component';
import { MaintenanceVouchersComponent } from './pages/bill-voucher/maintainance-vouchers/maintenance-vouchers.component';
import { HiredVehicleVouchersComponent } from './pages/bill-voucher/hired-vehicle-vouchers/hired-vehicle-vouchers.component';
import { ContractualRequisiteVehiclesVouchersComponent } from './pages/bill-voucher/Contractual-Requisite-Vehicles-Vouchers/contractual-requisite-vehicles-vouchers.component';
import { MiscellaneousStoreVouchersComponent } from './pages/bill-voucher/miscellaneous-store-vouchers/miscellaneous-store-vouchers.component';
import { AddHiredVehicleVoucherComponent } from './pages/bill-voucher/addVouchers/addHiredVehicle/add-hired-vehicle-voucher.component';
import { AddFuelVoucherComponent } from './pages/bill-voucher/addVouchers/AddFuelVoucher/add-fuel-voucher.component';
import { AddMaintenanceVoucherComponent } from './pages/bill-voucher/addVouchers/AddMaintenanceVoucher/add-maintenance-voucher.component';
import { AddContractualVoucherComponent } from './pages/bill-voucher/addVouchers/AddContractualVoucher/add-contractual-voucher.component';
import { AddMiscellaneousVoucherComponent } from './pages/bill-voucher/addVouchers/AddMiscellaneousVoucher/add-miscellaneous-voucher.component';
import { MainLayout } from './layouts/main-layout/main-layout';
import { OfficesComponent } from './pages/offices/view-offices/offices.component';
import { AddOfficeComponent } from './pages/offices/add-offices/add-office.component';
import { ModelsComponent } from './pages/models/models.component';
import { DesignationsComponent } from './pages/designations/designations.component';
import { authGuard } from './core/guards/auth-guard';
import { HomeRedirectComponent } from './pages/home-redirect/home-redirect.component';

export const routes: Routes = [
  { path: '', component: HomeRedirectComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'vehicle', component: Dashboard },
      { path: 'vehicles/add', component: AddVehicleComponent },
      { path: 'ifms-claims', component: IfmsClaimsComponent },
      { path: 'non-ifms-claims', component: NonTreasuryClaimsComponent },
      { path: 'bill-integration', component: SendBillsToIfmsComponent },
      { path: 'verify-vehicles', component: VerifyVehiclesComponent },
      { path: 'vehicle-details', component: VehicleDetailsComponent },
      { path: 'bill-voucher', component: FuelVouchersComponent },
      { path: 'maintenance-voucher', component: MaintenanceVouchersComponent },
      { path: 'hired-vehicle-voucher', component: HiredVehicleVouchersComponent },
      { path: 'contractual-requisite-vehicle-voucher', component: ContractualRequisiteVehiclesVouchersComponent },
      { path: 'miscellaneous-store-voucher', component: MiscellaneousStoreVouchersComponent },
      { path: 'bill-voucher/hired-vehicle/create', component: AddHiredVehicleVoucherComponent },
      { path: 'bill-voucher/create', component: AddFuelVoucherComponent },
      { path: 'maintenance-voucher/create', component: AddMaintenanceVoucherComponent },
      { path: 'contractual-requisite-vehicle-voucher/create', component: AddContractualVoucherComponent },
      { path: 'miscellaneous-store-voucher/create', component: AddMiscellaneousVoucherComponent },
      { path: 'master/office', component: OfficesComponent },
      { path: 'offices/add-office', component: AddOfficeComponent },
      { path: 'models', component: ModelsComponent },
      { path: 'designations', component: DesignationsComponent },
      // Future authenticated routes will be added here
    ]
  },
];