import { MaintenancePlanListItem } from './maintenance-plan.model';

export interface SearchMaintenancePlanResponse {
  total: number;
  results: MaintenancePlanListItem[];
}
