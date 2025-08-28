import { MaintenanceRepairItem } from './maintenance-rapair-item.model';

export interface SearchMaintenanceRepairResponse {
  total: number;
  results: MaintenanceRepairItem[];
}
