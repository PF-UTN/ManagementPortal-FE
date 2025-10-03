export interface OrderCreatePayload {
  clientId: string;
  orderStatusId: number;
  paymentDetail: {
    paymentTypeId: number;
  };
  deliveryMethodId: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
}
