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
