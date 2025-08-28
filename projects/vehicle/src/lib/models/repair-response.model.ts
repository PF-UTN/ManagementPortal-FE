import { RepairItem } from './repair-item.model';

export interface SearchMaintenanceRepairResponse {
  total: number;
  results: RepairItem[];
}
