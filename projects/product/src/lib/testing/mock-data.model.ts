import { ProductCategoryResponse } from '../models/product-category-response.model';
import { ProductCreate } from '../models/product-create-param.model';
import { ProductResponse } from '../models/product-create-response.model';
import { ProductDetail } from '../models/product-detail.model';
import { ProductListItem } from '../models/product-item.model';

export const mockProductListItems: ProductListItem[] = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description for Product 1',
    categoryName: 'Category 1',
    supplierBusinessName: 'Supplier 1',
    price: 100,
    stock: 50,
    enabled: true,
    weight: 20,
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
    weight: 20,
  },
];

export const mockProductListItemResponse = {
  total: mockProductListItems.length,
  results: mockProductListItems,
};

export const mockSuccessResponse = {
  message: 'Operación realizada con éxito.',
};

export const mockProductCreate: ProductCreate = {
  name: 'Test Product',
  description: 'A test product',
  price: 100,
  enabled: true,
  weight: 1,
  categoryId: 1,
  supplierId: 1,
  stock: {
    quantityOrdered: 10,
    quantityAvailable: 5,
    quantityReserved: 2,
  },
};

export const mockProductResponse: ProductResponse = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: '100',
  enabled: true,
  weight: '1',
  categoryId: 1,
  supplierId: 1,
  category: { name: 'Category 1', description: 'Category desc' },
  supplier: { businessName: 'Supplier 1' },
};

export const mockProductCategories: ProductCategoryResponse[] = [
  { id: 1, name: 'Category 1', description: 'Category desc' },
  { id: 2, name: 'Category 2', description: 'Another desc' },
];

export const mockProductDetail: ProductDetail = {
  id: 1,
  name: 'Producto Test',
  description: 'Descripción de prueba',
  category: { name: 'Categoría Test' },
  price: 100.5,
  stock: {
    quantityAvailable: 10,
    quantityOrdered: 5,
    quantityReserved: 2,
  },
  weight: 1.25,
  supplier: {
    businessName: 'Proveedor Test',
    email: 'proveedor@test.com',
    phone: '123456789',
  },
  enabled: true,
};

export const mockProductListItem: ProductListItem = {
  id: 1,
  name: 'Product 1',
  description: 'Description for Product 1',
  categoryName: 'Category 1',
  supplierBusinessName: 'Supplier 1',
  price: 100,
  stock: 50,
  enabled: true,
  weight: 20,
};
