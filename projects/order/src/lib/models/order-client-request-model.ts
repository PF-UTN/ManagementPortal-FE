export interface OrderClientSearchRequest {
  searchText: string;
  page: number;
  pageSize: number;
  filters?: {
    statusName?: string[];
    deliveryMethod?: string[];
    fromDate?: string;
    toDate?: string;
  };
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}
