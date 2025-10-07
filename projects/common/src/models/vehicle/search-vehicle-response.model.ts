import { VehicleListItem } from './vehicle-item.model';

export interface SearchVehicleResponse {
  total: number;
  results: VehicleListItem[];
}
