export interface MaintenanceItemSearchResult {
  id: number;
  description: string;
}

export interface SearchMaintenanceItemResponse {
  total: number;
  results: MaintenanceItemSearchResult[];
}
