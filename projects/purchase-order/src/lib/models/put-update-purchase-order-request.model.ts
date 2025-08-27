export interface PutUpdatePurchaseOrderRequest {
  purchaseOrderStatusId: number;
  observation: string;
  estimatedDeliveryDate: Date;
  purchaseOrderItems?: UpdatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}
