export interface VehicleListItem {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  enabled: boolean;
  kmTraveled: number;
  admissionDate: Date;
}
