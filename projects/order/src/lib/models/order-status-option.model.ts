import { OrderStatusOptions } from './order-status.enum';

export const statusOptions = [
  { key: OrderStatusOptions.Pending, value: 'Pendiente' },
  { key: OrderStatusOptions.InPreparation, value: 'En preparación' },
  { key: OrderStatusOptions.Prepared, value: 'Preparado' },
  { key: OrderStatusOptions.Shipped, value: 'Enviado' },
  { key: OrderStatusOptions.Finished, value: 'Finalizado' },
  { key: OrderStatusOptions.Cancelled, value: 'Cancelado' },
  { key: OrderStatusOptions.PaymentPending, value: 'Pago Pendiente' },
  { key: OrderStatusOptions.PaymentRejected, value: 'Pago Rechazado' },
] as const;
