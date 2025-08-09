import { PurchaseOrderItem } from '../models/purchase-order-item.model';

export const mockPurchaseOrderListItems: PurchaseOrderItem[] = [
  {
    id: 1,
    supplierBussinesName: 'Supplier 1',
    purchaseOrderStatusName: 'Pending',
    createdAt: new Date('2023-01-01'),
    estimatedDeliveryDate: new Date('2023-01-15'),
    effectiveDeliveryDate: new Date('2023-01-20'),
    totalAmount: 1000,
  },
  {
    id: 2,
    supplierBussinesName: 'Supplier 2',
    purchaseOrderStatusName: 'Ordered',
    createdAt: new Date('2023-02-01'),
    estimatedDeliveryDate: new Date('2023-02-15'),
    effectiveDeliveryDate: new Date('2023-02-20'),
    totalAmount: 2000,
  },
];

export const mockurchaseOrderListItemResponse = {
  total: mockPurchaseOrderListItems.length,
  results: mockPurchaseOrderListItems,
};
