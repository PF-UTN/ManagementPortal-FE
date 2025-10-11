export interface ShipmentSearchFilters {
  statusName?: string[];
  fromDate?: string;
  toDate?: string;
  vehicleId?: number;
}

export interface ShipmentSearchRequest {
  searchText: string;
  page: number;
  pageSize: number;
  filters?: ShipmentSearchFilters;
}

export interface ShipmentVehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
}

export interface ShipmentSearchResult {
  id: number;
  date: string;
  vehicle: ShipmentVehicle;
  status: string;
  orders: number[];
  estimatedKm: number | null;
  effectiveKm: number | null;
  routeLink: string | null;
}

export interface ShipmentSearchResponse {
  total: number;
  results: ShipmentSearchResult[];
}
