export interface OrderClientDetail {
  id: number;
  createdAt: Date;
  orderStatus: {
    name: string;
  };
  deliveryMethodName: string;
  client: {
    address: {
      street: string;
      streetNumber: string;
    };
  };
  paymentDetail: {
    paymentType: {
      name: string;
    };
  };
  totalAmount: number;
  orderItems: OrderDetailItem[];
}

export interface OrderDetailItem {
  product: {
    name: string;
    description: string;
    price: number;
    weight: number;
    category: {
      name: string;
    };
  };
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
}
