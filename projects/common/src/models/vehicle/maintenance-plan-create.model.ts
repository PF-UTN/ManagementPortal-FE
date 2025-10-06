export interface MaintenancePlanCreate {
  vehicleId: number;
  maintenanceItemId: number;
  kmInterval: number | null;
  timeInterval: number | null;
}

export interface MaintenancePlanUpdate {
  maintenanceItemId: number;
  kmInterval: number | null;
  timeInterval: number | null;
}
