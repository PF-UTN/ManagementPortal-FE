import { OrderClientDetail } from '../models/order-detail-client.model';

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
  orderItems: [
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
  ],
};
