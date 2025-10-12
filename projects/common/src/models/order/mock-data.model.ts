import { OrderDetail } from './order-detail.model';
import { OrderSearchResponse } from './order-response-model';

export const mockOrderListItems = {
  total: 2,
  results: [
    {
      id: 7,
      clientName: 'Juan Perez',
      orderStatusName: 'Pendiente',
      createdAt: '2025-09-22T15:32:28.188Z',
      totalAmount: 201,
    },
    {
      id: 1,
      clientName: 'Maria Gomez',
      orderStatusName: 'Pendiente',
      createdAt: '2025-09-20T11:02:59.042Z',
      totalAmount: 804,
    },
  ],
};

export const mockOrderSearchResponse: OrderSearchResponse = {
  total: 2,
  results: [
    {
      id: 1,
      createdAt: '2025-09-25T10:00:00.000Z',
      clientName: 'Juan Pérez',
      orderStatus: 'Finished',
      totalAmount: 500,
    },
    {
      id: 2,
      createdAt: '2025-09-26T12:30:00.000Z',
      clientName: 'Ana Gómez',
      orderStatus: 'Cancelled',
      totalAmount: 300,
    },
  ],
};

export const mockOrderDetail: OrderDetail = {
  id: 1,
  client: {
    companyName: 'Test Company',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    },
    address: {
      street: '123 Main St',
      streetNumber: 456,
    },
    taxCategory: {
      name: 'General',
      description: 'General Tax Category',
    },
  },
  deliveryMethodName: 'Express',
  orderStatus: {
    name: 'Pending',
  },
  paymentDetail: {
    paymentType: {
      name: 'Credit Card',
    },
  },
  orderItems: [
    {
      id: 1,
      product: {
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        enabled: true,
        weight: 1,
        category: {
          name: 'Category 1',
        },
        stock: {
          quantityAvailable: 10,
          quantityOrdered: 5,
          quantityReserved: 2,
        },
        supplier: {
          businessName: 'Supplier 1',
          email: 'supplier1@example.com',
          phone: '0987654321',
        },
      },
      unitPrice: 100,
      quantity: 5,
      subtotalPrice: 500,
      orderId: 1,
    },
  ],
  totalAmount: 804,
  createdAt: '2025-09-20T11:02:59.042Z',
};
