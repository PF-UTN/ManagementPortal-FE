export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  enabled: boolean;
  weight: string;
  categoryId: number;
  supplierId: number;
  category: {
    name: string;
    description: string;
  };
  supplier: {
    businessName: string;
  };
}
