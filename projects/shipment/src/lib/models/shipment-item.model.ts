import { ShipmentStatusOptions } from './shipment-status.enum';

export interface ShipmentItem {
  id: number;
  vehicleAssigned: string;
  shipmentStatus: ShipmentStatusOptions;
  createdAt: string;
}
