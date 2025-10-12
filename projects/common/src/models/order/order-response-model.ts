export interface OrderSearchResult {
  id: number;
  clientName: string;
  orderStatus: string;
  createdAt: string;
  totalAmount: number;
}

export interface OrderSearchResponse {
  total: number;
  results: OrderSearchResult[];
}
