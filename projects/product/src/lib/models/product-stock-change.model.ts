export enum StockChangeField {
  Available = 'Available',
  Reserved = 'Reserved',
  Ordered = 'Ordered',
}

export interface ProductStockChange {
  changedField: StockChangeField;
  previousValue: number;
  newValue: number;
}
