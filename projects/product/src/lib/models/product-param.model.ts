export enum ProductOrderField {
  Name = 'name',
  Price = 'price',
  // agrega más campos si es necesario
}

export enum ProductOrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface ProductOrderBy {
  field: ProductOrderField;
  direction: ProductOrderDirection;
}

export interface ProductParams {
  page: number;
  pageSize: number;
  searchText?: string;
  filters: {
    categoryName?: string[];
    supplierBusinessName?: string[];
    enabled?: boolean;
  };
  orderBy?: ProductOrderBy;
}
