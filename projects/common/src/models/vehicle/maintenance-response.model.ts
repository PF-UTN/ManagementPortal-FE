import { MaintenanceItem } from './maintenance-item.model';

export interface SearchMaintenanceRepairResponse {
  total: number;
  results: MaintenanceItem[];
}
