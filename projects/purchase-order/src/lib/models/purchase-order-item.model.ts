export interface PurchaseOrderItem {
  id: number;
  supplierBussinesName: string;
  purchaseOrderStatusName: string;
  createdAt: Date;
  estimatedDeliveryDate: Date | null;
  effectiveDeliveryDate: Date | null;
  totalAmount: number;
}
