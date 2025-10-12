export interface Client {
  id: number;
  address: {
    street: string;
    streetNumber: number;
    town: {
      name: string;
      zipCode: string;
      province: {
        name: string;
        country: {
          name: string;
        };
      };
    };
  };
}
