import { ShipmentStatusOptions } from './shipment-status.enum';

export const statusOptions = [
  { key: ShipmentStatusOptions.Pending, value: 'Pendiente' },
  { key: ShipmentStatusOptions.Shipped, value: 'Enviado' },
  { key: ShipmentStatusOptions.Finished, value: 'Finalizado' },
] as const;
