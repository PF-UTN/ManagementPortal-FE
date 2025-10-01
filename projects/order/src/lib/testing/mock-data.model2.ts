import {
  OrderClientDetail,
  OrderDetailItem,
} from '../models/order-detail-client.model';
import { OrderItem } from '../models/order-item.model';
import { OrderStatusOptions } from '../models/order-status.enum';

const orderItems: OrderDetailItem[] = [
  {
    product: {
      name: 'Producto 1',
      description: 'Descripción del producto',
      price: 100,
      weight: 2,
      category: {
        name: 'Alimentos',
      },
    },
    unitPrice: 100,
    quantity: 2,
    subtotalPrice: 200,
  },
];

export const mockOrderClientDetail: OrderClientDetail = {
  id: 123,
  createdAt: new Date('2025-09-22T15:32:28.188Z'),
  orderStatus: {
    name: 'Pendiente',
  },
  deliveryMethodName: 'Delivery',
  client: {
    address: {
      street: 'Calle Falsa',
      streetNumber: '123',
    },
  },
  paymentDetail: {
    paymentType: {
      name: 'Tarjeta',
    },
  },
  totalAmount: 201,
  orderItems: orderItems,
};

export const mockOrderItem: OrderItem = {
  id: 123,
  createdAt: '2025-09-22',
  status: OrderStatusOptions.Pending,
  totalAmount: 201,
  quantityProducts: 3,
};
