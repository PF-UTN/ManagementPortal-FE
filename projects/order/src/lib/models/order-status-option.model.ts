import { OrderStatusOptions } from './order-status.enum';

export const statusOptions = [
  { key: OrderStatusOptions.Pending, value: 'Pendiente' },
  { key: OrderStatusOptions.InPreparation, value: 'En preparación' },
  { key: OrderStatusOptions.Shipped, value: 'Enviado' },
  { key: OrderStatusOptions.Delivered, value: 'Entregado' },
  { key: OrderStatusOptions.Cancelled, value: 'Cancelado' },
  { key: OrderStatusOptions.Returned, value: 'Devuelto' },
] as const;
