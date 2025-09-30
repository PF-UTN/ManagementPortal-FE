import { PillStatusEnum } from '@Common-UI';

import { OrderStatusOptions } from '../models/order-status.enum';

export class OrderListUtils {
  static getStatusLabel(status: OrderStatusOptions): string {
    switch (status) {
      case OrderStatusOptions.Pending:
        return 'Pendiente';
      case OrderStatusOptions.InPreparation:
        return 'En preparación';
      case OrderStatusOptions.Prepared:
        return 'Preparado';
      case OrderStatusOptions.Shipped:
        return 'Enviado';
      case OrderStatusOptions.Finished:
        return 'Finalizado';
      case OrderStatusOptions.Cancelled:
        return 'Cancelado';
      case OrderStatusOptions.PaymentPending:
        return 'Pago pendiente';
      case OrderStatusOptions.PaymentRejected:
        return 'Pago rechazado';
      default:
        return 'Pendiente';
    }
  }

  static mapStatusToPillStatus(status: OrderStatusOptions): PillStatusEnum {
    switch (status) {
      case OrderStatusOptions.Pending:
        return PillStatusEnum.Initial;
      case OrderStatusOptions.InPreparation:
      case OrderStatusOptions.Prepared:
      case OrderStatusOptions.Shipped:
        return PillStatusEnum.InProgress;
      case OrderStatusOptions.Finished:
        return PillStatusEnum.Done;
      case OrderStatusOptions.Cancelled:
      case OrderStatusOptions.PaymentRejected:
        return PillStatusEnum.Cancelled;
      case OrderStatusOptions.PaymentPending:
        return PillStatusEnum.Warning;
      default:
        return PillStatusEnum.Initial;
    }
  }
}
