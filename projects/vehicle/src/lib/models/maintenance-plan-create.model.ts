export interface MaintenancePlanCreate {
  vehicleId: number;
  maintenanceItemId: number;
  kmInterval: number | null;
  timeInterval: number | null;
}
