import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { ExecuteLateralDrawerComponent } from './execute-lateral-drawer.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { mockPurchaseOrderDetail } from '../../testing/mock-data.model';

describe('ExecuteLateralDrawerComponent', () => {
  let component: ExecuteLateralDrawerComponent;
  let fixture: ComponentFixture<ExecuteLateralDrawerComponent>;
  let purchaseOrderService: PurchaseOrderService;
  let snackBarMock: { open: jest.Mock };

  beforeEach(async () => {
    snackBarMock = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ExecuteLateralDrawerComponent],
      providers: [
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        {
          provide: PurchaseOrderService,
          useValue: mockDeep<PurchaseOrderService>(),
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecuteLateralDrawerComponent);
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

  describe('onSubmit', () => {
    it('should call updatePurchaseOrderStatusAsync and show success snackbar on success', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(of(undefined));
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(
        purchaseOrderService.updatePurchaseOrderStatusAsync,
      ).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Orden de compra ejecutada correctamente',
        'Cerrar',
        { duration: 3000 },
      );
    }));

    it('should handle generic error', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(
          throwError(() => ({
            error: { message: 'Other error' },
          })),
        );
      // Act
      component.onSubmit();

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al ejecutar la orden de compra.',
        'Cerrar',
        { duration: 5000 },
      );
    }));
  });
});
