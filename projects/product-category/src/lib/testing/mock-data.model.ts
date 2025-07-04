import { ProductCategoryRequest } from '../models/product-category-request.model';
import { ProductCategoryResponse } from '../models/product-category-response.model';

export const mockProductCategory: ProductCategoryResponse = {
  id: 1,
  name: 'Category 1',
  description: 'Description for Category 1',
};

export const mockNewProductCategory: ProductCategoryRequest = {
  id: null,
  name: 'Category 1',
  description: 'Description for Category 1',
};

export const mockUpdatedProductCategory: ProductCategoryRequest = {
  id: 1,
  name: 'Category 1',
  description: 'Description for Category 1',
};
