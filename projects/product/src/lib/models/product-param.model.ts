export interface ProductParams {
  page: number;
  pageSize: number;
  searchText?: string;
  filters?: {
    category?: string[];
    supplier?: string[];
    enabled?: boolean;
  };
}
