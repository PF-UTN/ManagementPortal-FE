import { OrderStatusOptions } from './order-status.enum';

export interface OrderItem {
  id: number;
  createdAt: string;
  clientName: string;
  orderStatus: OrderStatusOptions;
  totalAmount: number;
  selected?: boolean;
}
