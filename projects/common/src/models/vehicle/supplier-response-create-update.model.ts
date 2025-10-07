export interface ServiceSupplierResponse {
  id: number;
  businessName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  addressId: number;
}

export interface ServiceSupplierDetailResponse {
  id: number;
  businessName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  addressId: number;
  address: {
    id: number;
    townId: number;
    street: string;
    streetNumber: number;
    town: {
      id: number;
      name: string;
      zipCode: string;
      provinceId: number;
    };
  };
}
