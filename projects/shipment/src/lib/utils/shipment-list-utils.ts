import { PillStatusEnum } from '@Common-UI';

import { ShipmentStatusOptions } from '../models/shipment-status.enum';

export class ShipmentListUtils {
  static getStatusLabel(status: ShipmentStatusOptions): string {
    switch (status) {
      case ShipmentStatusOptions.Pending:
        return 'Pendiente';
      case ShipmentStatusOptions.Shipped:
        return 'Enviada';
      case ShipmentStatusOptions.Finished:
        return 'Finalizado';
      default:
        return 'Pendiente';
    }
  }

  static mapStatusToPillStatus(
    status: ShipmentStatusOptions | undefined | null,
  ): PillStatusEnum {
    switch (status) {
      case ShipmentStatusOptions.Pending:
        return PillStatusEnum.Initial;
      case ShipmentStatusOptions.Shipped:
        return PillStatusEnum.InProgress;
      case ShipmentStatusOptions.Finished:
        return PillStatusEnum.Done;
      default:
        return PillStatusEnum.Warning;
    }
  }
}
