import { ProductListItem } from '../models/product-item.model';

export const mockProductListItem: ProductListItem[] = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description for Product 1',
    categoryName: 'Category 1',
    supplierBusinessName: 'Supplier 1',
    price: 100,
    stock: 50,
    enabled: true,
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description for Product 2',
    categoryName: 'Category 2',
    price: 200,
    supplierBusinessName: 'Supplier 2',
    stock: 30,
    enabled: false,
  },
];

export const mockProductListItemResponse = {
  total: mockProductListItem.length,
  results: mockProductListItem,
};

export const mockSuccessResponse = {
  message: 'Operación realizada con éxito.',
};
