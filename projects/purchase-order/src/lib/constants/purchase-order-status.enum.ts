export enum PurchaseOrderStatusOptions {
  Draft = 'Borrador',
  Rejected = 'Rechazada',
  Ordered = 'Pedida',
  Received = 'Recibida',
  Cancelled = 'Cancelada',
}

export const PurchaseOrderStatusIdMap: Record<
  PurchaseOrderStatusOptions,
  number
> = {
  [PurchaseOrderStatusOptions.Draft]: 1,
  [PurchaseOrderStatusOptions.Rejected]: 2,
  [PurchaseOrderStatusOptions.Ordered]: 3,
  [PurchaseOrderStatusOptions.Received]: 4,
  [PurchaseOrderStatusOptions.Cancelled]: 5,
};

export const PurchaseOrderStatusEnabledForDeletion: string[] = [
  PurchaseOrderStatusOptions.Draft,
  PurchaseOrderStatusOptions.Cancelled,
];

export const PurchaseOrderStatusEnabledForModification: string[] = [
  PurchaseOrderStatusOptions.Draft,
];

export const PurchaseOrderStatusEnabledForReception: string[] = [
  PurchaseOrderStatusOptions.Ordered,
];
