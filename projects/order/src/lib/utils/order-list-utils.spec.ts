import { PillStatusEnum } from '@Common-UI';

import { OrderListUtils } from './order-list-utils';
import { OrderStatusOptions } from '../models/order-status.enum';

describe('OrderListUtils', () => {
  describe('getStatusLabel', () => {
    it('should return correct label for Finished', () => {
      expect(OrderListUtils.getStatusLabel(OrderStatusOptions.Finished)).toBe(
        'Finalizado',
      );
    });

    it('should return correct label for Cancelled', () => {
      expect(OrderListUtils.getStatusLabel(OrderStatusOptions.Cancelled)).toBe(
        'Cancelado',
      );
    });
  });

  describe('mapStatusToPillStatus', () => {
    it('should return PillStatusEnum.Done for Finished', () => {
      expect(
        OrderListUtils.mapStatusToPillStatus(OrderStatusOptions.Finished),
      ).toBe(PillStatusEnum.Done);
    });

    it('should return PillStatusEnum.Cancelled for Cancelled', () => {
      expect(
        OrderListUtils.mapStatusToPillStatus(OrderStatusOptions.Cancelled),
      ).toBe(PillStatusEnum.Cancelled);
    });
  });
});
