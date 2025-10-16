export interface ShipmentFinishRequest {
  finishedAt: string;
  odometer: number;
  orders: {
    orderId: number;
    orderStatusId: number;
  }[];
}
