export interface User {
  id: number;
  username: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  districtId?: number;
  districtName: string;
  departmentId?: number;
  departmentName: string;
  ddoCode: string;
  ddoRegistrationNo?: string;
  managedDdos?: string;
  isActive: boolean;
  isNonTreasuryDDO: boolean;
  roles: string[];
  createdAt: string;
}

export interface UserFormData {
  username: string;
  password?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  districtId?: number;
  departmentId?: number;
  ddoCode: string;
  ddoRegistrationNo?: string;
  managedDdos?: string;
  isActive: boolean;
  isNonTreasuryDDO: boolean;
  roles: string[];
}
