export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
  supplier: {
    businessName: string;
    email: string;
    phone: string;
  };
  stock: {
    quantityAvailable: number;
    quantityOrdered: number;
    quantityReserved: number;
  };
  enabled: boolean;
  weight: number;
}
