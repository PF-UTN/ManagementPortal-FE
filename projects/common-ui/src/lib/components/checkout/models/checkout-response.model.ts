import { CheckoutItem } from './checkout-item.model';

export interface CheckoutResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  items: CheckoutItem[];
}
