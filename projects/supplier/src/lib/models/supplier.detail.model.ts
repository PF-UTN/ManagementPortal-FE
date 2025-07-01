export interface SupplierDetail {
  id: number;
  businessName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    streetNumber: number;
    townId: number;
    town: {
      id: number;
      name: string;
      zipCode: string;
      provinceId: number;
    };
  };
}
