import { Address } from './address.model';

export interface User {
  fullNameOrBusinessName: string;
  documentNumber: string;
  documentType: string;
  email: string;
  phone: string;
  taxCategory: string;
  address: Address;
}
