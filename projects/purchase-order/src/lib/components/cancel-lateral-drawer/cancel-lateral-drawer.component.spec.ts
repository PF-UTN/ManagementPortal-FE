import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CancelLateralDrawerComponent } from './cancel-lateral-drawer.component';
import { PurchaseOrderStatusOptionsId } from '../../constants/purchase-order-status-ids.enum';
import { PostUpdatePurchaseOrderStatusRequest } from '../../models/post-cancel-purchase-order-request.model';
import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

describe('CancelLateralDrawerComponent', () => {
  let component: CancelLateralDrawerComponent;
  let fixture: ComponentFixture<CancelLateralDrawerComponent>;
  let purchaseOrderService: PurchaseOrderService;

  const mockData = {
    id: 42,
    purchaseOrderStatusName: 'Active',
    totalAmount: 1000,
    createdAt: new Date('2025-08-20T00:00:00Z'),
  } as PurchaseOrderItem;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CancelLateralDrawerComponent, NoopAnimationsModule],
      providers: [
        {
          provide: PurchaseOrderService,
          useValue: mockDeep<PurchaseOrderService>(),
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
      ],
    });

    fixture = TestBed.createComponent(CancelLateralDrawerComponent);
    component = fixture.componentInstance;

    purchaseOrderService = TestBed.inject(PurchaseOrderService);

    component.data = mockData;

    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should initialize form with cancelReason control', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.contains('cancelReason')).toBe(true);
    });

    it('should update isFormInvalid when form becomes valid', () => {
      // Arrange
      component.form.setValue({ cancelReason: 'Valid reason' });

      // Act
      component.form.updateValueAndValidity();

      // Assert
      expect(component.isFormInvalid()).toBe(false);
    });

    it('should update isFormInvalid when form is invalid', () => {
      // Arrange
      component.form.setValue({ cancelReason: '' });

      // Act
      component.form.updateValueAndValidity();

      // Assert
      expect(component.isFormInvalid()).toBe(true);
    });
  });

  describe('handleConfirmClick', () => {
    beforeEach(() => {
      component.form.setValue({ cancelReason: 'Motivo de cancelación' });
    });

    it('should call updatePurchaseOrderStatusAsync with correct arguments', fakeAsync(() => {
      // Arrange
      const updateSpy = jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(of());

      // Act
      component.handleConfirmClick();
      tick();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        mockData.id,
        new PostUpdatePurchaseOrderStatusRequest(
          PurchaseOrderStatusOptionsId.Cancelled,
          'Motivo de cancelación',
        ),
      );
    }));

    it('should set isLoading to false after completion', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(of());

      // Act
      component.handleConfirmClick();
      tick();

      // Assert
      expect(component.isLoading()).toBe(false);
    }));
  });
});
