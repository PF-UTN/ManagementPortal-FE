import { ProductListItem } from './product-item.model';

export interface SearchProductResponse {
  total: number;
  results: ProductListItem[];
}
