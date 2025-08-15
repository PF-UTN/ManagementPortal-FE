export enum PurchaseOrderStatusOptions {
  Draft = 'Borrador',
  Pending = 'Pendiente',
  Rejected = 'Rechazada',
  Ordered = 'Ordenada',
  Received = 'Recibida',
  Cancelled = 'Cancelada',
}

export const PurchaseOrderStatusEnabledForDeletion: string[] = [
  PurchaseOrderStatusOptions.Draft,
  PurchaseOrderStatusOptions.Cancelled,
];
