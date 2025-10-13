export interface OrderSearchRequest {
  searchText: string;
  page: number;
  pageSize: number;
  filters?: {
    statusName?: string[];
    deliveryMethod?: string[];
    fromCreatedAtDate?: string;
    toCreatedAtDate?: string;
  };
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}
