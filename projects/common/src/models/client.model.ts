export interface Client {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  birthdate: Date;
  documentNumber: string;
  documentType: string;
  companyName: string;
  taxCategoryId: number;
  address: {
    street: string;
    streetNumber: number;
    townId: number;
  };
}
