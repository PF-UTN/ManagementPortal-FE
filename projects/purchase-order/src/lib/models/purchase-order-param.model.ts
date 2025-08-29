import { OrderDirection } from 'projects/common/src/constants/order-direction.enum';

export enum PurchaseOrderOrderField {
  CreatedAt = 'createdAt',
  totalAmount = 'totalAmount',
}

export interface PurchaseOrderOrderBy {
  field: PurchaseOrderOrderField;
  direction: OrderDirection;
}

export interface PurchaseOrderOrderOption {
  label: string;
  field: PurchaseOrderOrderField;
  direction: OrderDirection;
}

export interface PurchaseOrderParams {
  searchText?: string;
  page: number;
  pageSize: number;
  filters: {
    statusName?: string[];
    supplierBusinessName?: string[];
    fromDate?: Date | null;
    toDate?: Date | null;
    fromEstimatedDeliveryDate?: Date | null;
    toEstimatedDeliveryDate?: Date | null;
  };
  orderBy: PurchaseOrderOrderBy;
}

export interface PurchaseOrder {
  supplierId: number;
  estimatedDeliveryDate: string;
  observation: string;
  purchaseOrderItems: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
  purchaseOrderStatusId: number;
}
