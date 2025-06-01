export interface ProductParams {
  page: number;
  pageSize: number;
  searchText?: string;
  filters?: {
    categoryName?: string[];
    supplierBusinessName?: string[];
    enabled?: boolean;
  };
}
