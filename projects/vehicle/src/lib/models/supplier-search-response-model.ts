export interface SupplierSearchResult {
  id: number;
  businessName: string;
}

export interface SupplierSearchResponseModel {
  total: number;
  results: SupplierSearchResult[];
}
