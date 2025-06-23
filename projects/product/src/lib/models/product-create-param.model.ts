export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  weight: number;
  categoryId: number;
  supplierId: number;
  stock: {
    quantityOrdered: number;
    quantityAvailable: number;
    quantityReserved: number;
  };
}
