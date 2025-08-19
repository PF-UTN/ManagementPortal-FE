import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { DetailLateralDrawerComponent } from './detail-lateral-drawer.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { mockPurchaseOrderDetail } from '../../testing/mock-data.model';

describe('DetailLateralDrawerComponent', () => {
  let component: DetailLateralDrawerComponent;
  let fixture: ComponentFixture<DetailLateralDrawerComponent>;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLateralDrawerComponent],
      providers: [
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        {
          provide: PurchaseOrderService,
          useValue: mockDeep<PurchaseOrderService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailLateralDrawerComponent);
    component = fixture.componentInstance;
    purchaseOrderService = TestBed.inject(PurchaseOrderService);
    component.purchaseOrderId = mockPurchaseOrderDetail.id;

    jest
      .spyOn(purchaseOrderService, 'getPurchaseOrderById')
      .mockReturnValue(of(mockPurchaseOrderDetail));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call purchaseOrderService.getPurchaseOrderById with the correct purchaseOrderId on ngOnInit', () => {
    //Arrange
    component.purchaseOrderId = mockPurchaseOrderDetail.id;

    //Act
    fixture.detectChanges();

    // Assert
    expect(purchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith(
      mockPurchaseOrderDetail.id,
    );
  });

  it('should set the purchase order detail data after loading', () => {
    // Arrange
    const expectedData = mockPurchaseOrderDetail;

    // Act
    const result = component.data();

    // Assert
    expect(result).toEqual(expectedData);
  });

  it('should set isLoading to false after purchase order detail is loaded', () => {
    // Act
    const result = component.isLoading();

    // Assert
    expect(result).toBe(false);
  });
});
