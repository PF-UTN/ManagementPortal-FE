import { OrderDirection } from '@Common';

export enum OrderOrderField {
  CreatedAt = 'createdAt',
  totalAmount = 'totalAmount',
}

export interface OrderOrderBy {
  field: OrderOrderField;
  direction: OrderDirection;
}

export interface OrderOrderOption {
  label: string;
  field: OrderOrderField;
  direction: OrderDirection;
}

export interface OrderParams {
  searchText?: string;
  page: number;
  pageSize: number;
  filters: {
    statusName?: string[];
    fromCreatedAtDate?: string | null;
    toCreatedAtDate?: string | null;
    deliveryMethodId?: number[] | null;
    shipmentId?: number | null;
  };
  orderBy: OrderOrderBy;
}
