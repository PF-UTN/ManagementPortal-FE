import { CartUpdateProductQuantity } from '../models/cart-update-product-quantity.model';
import { Cart } from '../models/cart.model';
import { mockProductDetail } from './../../../../product/src/lib/testing';

export const mockCart: Cart = {
  cartId: '1',
  items: [{ product: mockProductDetail, quantity: 2 }],
};

export const mockCartUpdateProductQuantity: CartUpdateProductQuantity = {
  productId: 1,
  quantity: 3,
};
