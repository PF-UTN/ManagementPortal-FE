export interface ServiceSupplierCreateUpdate {
  businessName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    streetNumber: number;
    townId: number;
  };
}
