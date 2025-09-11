import { LateralDrawerService } from '@Common-UI';

import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ReceptionLateralDrawerComponent } from './reception-lateral-drawer.component';
import { PurchaseOrderDetail } from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

describe('ReceptionLateralDrawerComponent', () => {
  let component: ReceptionLateralDrawerComponent;
  let fixture: ComponentFixture<ReceptionLateralDrawerComponent>;
  let purchaseOrderService: PurchaseOrderService;
  const snackBarMock = { open: jest.fn() };
  let dialog: MatDialog;

  registerLocaleData(localeEsAr);

  const mockPurchaseOrderDetail: PurchaseOrderDetail = {
    id: 1,
    createdAt: new Date('2025-09-01'),
    estimatedDeliveryDate: new Date('2025-09-10'),
    effectiveDeliveryDate: null,
    observation: 'Test observation',
    totalAmount: 350,
    status: { id: 4, name: 'Recibida' },
    supplier: { id: 99, businessName: 'Proveedor Test' },
    purchaseOrderItems: [
      {
        productId: 1,
        productName: 'Producto 1',
        quantity: 2,
        unitPrice: 100,
        subtotalPrice: 200,
      },
      {
        productId: 2,
        productName: 'Producto 2',
        quantity: 3,
        unitPrice: 50,
        subtotalPrice: 150,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReceptionLateralDrawerComponent, NoopAnimationsModule],
      providers: [
        {
          provide: PurchaseOrderService,
          useValue: mockDeep<PurchaseOrderService>(),
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: mockDeep<MatDialog>() },
      ],
    });

    purchaseOrderService = TestBed.inject(PurchaseOrderService);
    jest
      .spyOn(purchaseOrderService, 'getPurchaseOrderById')
      .mockReturnValue(of(mockPurchaseOrderDetail));

    fixture = TestBed.createComponent(ReceptionLateralDrawerComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);

    component.purchaseOrderId = 1;
    snackBarMock.open.mockClear();
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should fetch purchase order and initialize form', () => {
      // arrange
      jest
        .spyOn(purchaseOrderService, 'getPurchaseOrderById')
        .mockReturnValue(of(mockPurchaseOrderDetail));
      // act
      component.ngOnInit();
      // assert
      expect(purchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith(1);
      expect(component.data()).toEqual(mockPurchaseOrderDetail);
      expect(component.isLoadingData()).toBe(false);
      expect(component.form.value.items!.length).toBe(2);
    });
  });

  describe('initializeForm', () => {
    it('should initialize form controls with correct values', () => {
      // arrange
      component.data.set(mockPurchaseOrderDetail);
      // act
      component['initializeForm']();
      // assert
      expect(component.form.value.items![0].quantity).toBe(2);
      expect(component.form.value.items![0].price).toBe(100);
      expect(component.form.value.items![1].quantity).toBe(3);
      expect(component.form.value.items![1].price).toBe(50);
    });
  });

  describe('updateSubtotalAndValidation', () => {
    it('should set isFormInvalid to true if any item is invalid', () => {
      // arrange
      component.data.set(mockPurchaseOrderDetail);
      component['initializeForm']();
      component.form.setValue({
        items: [
          { quantity: 0, price: 100 },
          { quantity: 3, price: 50 },
        ],
      });
      // act
      component['updateSubtotalAndValidation']();
      // assert
      expect(component.isFormInvalid()).toBe(true);
    });

    it('should set isFormInvalid to false if all items are valid', () => {
      // arrange
      component.data.set(mockPurchaseOrderDetail);
      component['initializeForm']();
      component.form.setValue({
        items: [
          { quantity: 2, price: 100 },
          { quantity: 3, price: 50 },
        ],
      });
      // act
      component['updateSubtotalAndValidation']();
      // assert
      expect(component.isFormInvalid()).toBe(false);
    });

    it('should calculate subtotal correctly', () => {
      // arrange
      component.data.set(mockPurchaseOrderDetail);
      component['initializeForm']();
      component.form.setValue({
        items: [
          { quantity: 2, price: 100 },
          { quantity: 3, price: 50 },
        ],
      });
      // act
      component['updateSubtotalAndValidation']();
      // assert
      expect(component.subtotal()).toBe(350);
    });
  });

  describe('handleConfirmClick', () => {
    beforeEach(() => {
      component.data.set(mockPurchaseOrderDetail);
      component['initializeForm']();
    });

    it('should open modal and do nothing if cancelled', () => {
      // arrange
      const dialogRefMock = {
        afterClosed: () => of(false),
      } as MatDialogRef<boolean>;
      jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);
      // act
      component.handleConfirmClick();
      // assert
      expect(dialog.open).toHaveBeenCalled();
      expect(
        purchaseOrderService.updatePurchaseOrderAsync,
      ).not.toHaveBeenCalled();
    });
  });
});
