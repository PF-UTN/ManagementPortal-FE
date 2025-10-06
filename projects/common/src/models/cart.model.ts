import { ProductDetail } from '@Product';

export interface CartItem {
  product: ProductDetail;
  quantity: number;
}
export interface Cart {
  cartId: string;
  items: CartItem[];
}
