export type OrderListOrderField = 'createdAt' | 'price';

export interface OrderListOrderOption {
  label: string;
  field: OrderListOrderField;
  direction: 'asc' | 'desc';
}

export const ORDER_LIST_ORDER_OPTIONS: OrderListOrderOption[] = [
  {
    label: 'Fecha creacion: Ascendente',
    field: 'createdAt',
    direction: 'asc',
  },
  {
    label: 'Fecha creacion: Descendente',
    field: 'createdAt',
    direction: 'desc',
  },
  {
    label: 'Precio: Menor a Mayor',
    field: 'price',
    direction: 'asc',
  },
  {
    label: 'Precio: Mayor a Menor',
    field: 'price',
    direction: 'desc',
  },
];
