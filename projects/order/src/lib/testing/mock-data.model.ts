import { OrderSearchResponse } from '../models/order-response-model';

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
