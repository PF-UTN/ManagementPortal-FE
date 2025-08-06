export enum PurchaseOrderOrderField {
  CreatedAt = 'createdAt',
  totalAmount = 'totalAmount',
}

export enum PurchaseOrderOrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface PurchaseOrderOrderBy {
  field: PurchaseOrderOrderField;
  direction: PurchaseOrderOrderDirection;
}

export interface PurchaseOrderParams {
  searchText?: string;
  page: number;
  pageSize: number;
  filters: {
    statusId?: string[];
    supplierBusinessName?: string[];
    fromDate?: Date | null;
    toDate?: Date | null;
    fromEffectiveDeliveryDate?: Date | null;
    toEffectiveDeliveryDate?: Date | null;
  };
  orderBy?: PurchaseOrderOrderBy;
}
