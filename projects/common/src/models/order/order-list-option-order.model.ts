import { OrderDirection } from '@Common';

import { OrderOrderField } from './order-params.model';

export interface OrderListOrderOption {
  label: string;
  field: OrderOrderField;
  direction: OrderDirection;
}

export const ORDER_LIST_ORDER_OPTIONS: OrderListOrderOption[] = [
  {
    label: 'Fecha creacion: Ascendente',
    field: OrderOrderField.CreatedAt,
    direction: OrderDirection.ASC,
  },
  {
    label: 'Fecha creacion: Descendente',
    field: OrderOrderField.CreatedAt,
    direction: OrderDirection.DESC,
  },
  {
    label: 'Precio: Menor a Mayor',
    field: OrderOrderField.totalAmount,
    direction: OrderDirection.ASC,
  },
  {
    label: 'Precio: Mayor a Menor',
    field: OrderOrderField.totalAmount,
    direction: OrderDirection.DESC,
  },
];
