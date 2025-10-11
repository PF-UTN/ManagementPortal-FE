import { ShipmentStatusOptions } from './shipment-status.enum';

export const statusOptions = [
  { key: ShipmentStatusOptions.Pending, value: 'Pendiente' },
  { key: ShipmentStatusOptions.Shipped, value: 'Enviada' },
  { key: ShipmentStatusOptions.Finished, value: 'Finalizado' },
] as const;
