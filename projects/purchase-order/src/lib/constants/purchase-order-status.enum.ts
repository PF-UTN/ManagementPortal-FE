export enum PurchaseOrderStatusOptions {
  Draft = 'Borrador',
  Rejected = 'Rechazada',
  Ordered = 'Pedida',
  Received = 'Recibida',
  Cancelled = 'Cancelada',
}

export const PurchaseOrderStatusEnabledForCancelled: string[] = [
  PurchaseOrderStatusOptions.Draft,
  PurchaseOrderStatusOptions.Ordered,
];

export const PurchaseOrderStatusEnabledForDeletion: string[] = [
  PurchaseOrderStatusOptions.Draft,
  PurchaseOrderStatusOptions.Cancelled,
];

export const PurchaseOrderStatusEnabledForModification: string[] = [
  PurchaseOrderStatusOptions.Draft,
];

export const PurchaseOrderStatusEnabledForExecution: string[] = [
  PurchaseOrderStatusOptions.Draft,
];

export const PurchaseOrderStatusEnabledForReception: string[] = [
  PurchaseOrderStatusOptions.Ordered,
];
