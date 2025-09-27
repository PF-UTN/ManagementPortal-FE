export interface CheckoutItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  picture_url?: string;
}
