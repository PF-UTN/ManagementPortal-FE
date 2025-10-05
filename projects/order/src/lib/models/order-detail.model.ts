export interface OrderDetail {
  id: number;
  client: {
    companyName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    address: {
      street: string;
      streetNumber: number;
    };
    taxCategory: {
      name: string;
      description: string;
    };
  };
  deliveryMethodName: string;
  orderStatus: {
    name: string;
  };
  paymentDetail: {
    paymentType: {
      name: string;
    };
  };
  orderItems: OrderDetailItem[];
  totalAmount: number;
  createdAt: string;
}

export interface OrderDetailItem {
  id: number;
  product: {
    name: string;
    description: string;
    price: number;
    enabled: boolean;
    weight: number;
    category: {
      name: string;
    };
    stock: {
      quantityAvailable: number;
      quantityOrdered: number;
      quantityReserved: number;
    };
    supplier: {
      businessName: string;
      email: string;
      phone: string;
    };
  };
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
  orderId: number;
}
