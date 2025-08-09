import { PurchaseOrderItem } from './purchase-order-item.model';

export interface SearchPurchaseOrderResponse {
  total: number;
  results: PurchaseOrderItem[];
}
