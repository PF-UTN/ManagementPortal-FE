export interface OrderClientSearchResult {
  id: number;
  orderStatusName: string;
  createdAt: string;
  totalAmount: number;
  productsCount: number;
}

export interface OrderClientSearchResponse {
  total: number;
  results: OrderClientSearchResult[];
}
