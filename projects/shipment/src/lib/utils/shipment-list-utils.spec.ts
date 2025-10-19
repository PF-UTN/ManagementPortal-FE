import { PillStatusEnum } from '@Common-UI';

import { ShipmentListUtils } from './shipment-list-utils';
import { ShipmentStatusOptions } from '../models/shipment-status.enum';

describe('ShipmentListUtils', () => {
  describe('getStatusLabel', () => {
    it('should return correct label for Finished', () => {
      expect(
        ShipmentListUtils.getStatusLabel(ShipmentStatusOptions.Finished),
      ).toBe('Finalizado');
    });

    it('should return correct label for Shipped', () => {
      expect(
        ShipmentListUtils.getStatusLabel(ShipmentStatusOptions.Shipped),
      ).toBe('Enviada');
    });

    it('should return correct label for Pending', () => {
      expect(
        ShipmentListUtils.getStatusLabel(ShipmentStatusOptions.Pending),
      ).toBe('Pendiente');
    });

    it('should return "Pendiente" for unknown status (default case)', () => {
      // @ts-expect-error purposely passing an invalid value
      expect(ShipmentListUtils.getStatusLabel('UNKNOWN')).toBe('Pendiente');
    });
  });

  describe('mapStatusToPillStatus', () => {
    it('should return PillStatusEnum.Done for Finished', () => {
      expect(
        ShipmentListUtils.mapStatusToPillStatus(ShipmentStatusOptions.Finished),
      ).toBe(PillStatusEnum.Done);
    });

    it('should return PillStatusEnum.InProgress for Shipped', () => {
      expect(
        ShipmentListUtils.mapStatusToPillStatus(ShipmentStatusOptions.Shipped),
      ).toBe(PillStatusEnum.InProgress);
    });
  });
});
