export interface MaintenanceItem {
  id: number;
  date: string;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  description: string;
  kmPerformed: number;
}
