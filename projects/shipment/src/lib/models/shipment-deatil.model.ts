export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  kmTraveled: number;
}

export interface ShipmentOrder {
  id: number;
  status: string;
}

export interface ShipmentDetail {
  id: number;
  date: string;
  estimatedKm: number | null;
  effectiveKm: number | null;
  finishedAt: string | null;
  routeLink: string | null;
  vehicle: Vehicle;
  status: string;
  orders: ShipmentOrder[];
}
