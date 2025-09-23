import { OrderStatusOptions } from './order-status.enum';

export interface OrderItem {
  id: number;
  createdAt: string;
  status: OrderStatusOptions;
  totalAmount: number;
  quantityProducts: number;
}
