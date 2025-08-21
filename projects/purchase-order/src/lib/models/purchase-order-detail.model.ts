export interface PurchaseOrderDetail {
  id: number;
  createdAt: Date;
  estimatedDeliveryDate: Date;
  effectiveDeliveryDate: Date | null;
  observation: string | null;
  totalAmount: number;
  status: {
    id: number;
    name: string;
  };
  supplier: string;
  purchaseOrderItems: PurchaseOrderItemDetail[];
}

export interface PurchaseOrderItemDetail {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}
