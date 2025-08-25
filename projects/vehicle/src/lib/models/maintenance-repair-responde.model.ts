import { MaintenanceRepairItem } from './maintenance-rapir-item.model';

export interface SearchMaintenanceRepairResponse {
  total: number;
  results: MaintenanceRepairItem[];
}
