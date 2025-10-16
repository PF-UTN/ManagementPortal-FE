export interface OrderSearchResult {
  id: number;
  clientName: string;
  orderStatus: string;
  createdAt: string;
  totalAmount: number;
  deliveryMethod: string;
  shipmentId: number | null;
}

export interface OrderSearchResponse {
  total: number;
  results: OrderSearchResult[];
}
