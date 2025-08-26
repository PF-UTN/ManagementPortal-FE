export class PostUpdatePurchaseOrderStatusRequest {
  constructor(
    public purchaseOrderStatusId: number,
    public observation?: string,
    public effectiveDeliveryDate?: Date,
  ) {}
}
