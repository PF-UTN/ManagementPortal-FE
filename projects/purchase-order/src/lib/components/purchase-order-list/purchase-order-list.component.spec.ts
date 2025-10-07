import { downloadFileFromResponse, OrderDirection } from '@Common';
import { LateralDrawerService, PillStatusEnum } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { PurchaseOrderListComponent } from './purchase-order-list.component';
import { PurchaseOrderStatusOptions } from '../../constants/purchase-order-status.enum';
import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import { PurchaseOrderOrderField } from '../../models/purchase-order-param.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { mockPurchaseOrderListItems } from '../../testing/mock-data.model';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';
import { ExecuteLateralDrawerComponent } from '../execute-lateral-drawer/execute-lateral-drawer.component';

jest.mock('@Common', () => ({
  downloadFileFromResponse: jest.fn(),
  OrderDirection: {
    ASC: 'asc',
    DESC: 'desc',
  },
}));

describe('PurchaseOrderListComponent', () => {
  let component: PurchaseOrderListComponent;
  let fixture: ComponentFixture<PurchaseOrderListComponent>;
  let service: PurchaseOrderService;
  let lateralDrawerService: LateralDrawerService;
  let matDialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderListComponent, CommonModule, NoopAnimationsModule],
      providers: [
        {
          provide: PurchaseOrderService,
          useValue: mockDeep<PurchaseOrderService>(),
        },
        {
          provide: MatSnackBar,
          useValue: { open: jest.fn() },
        },
        {
          provide: MatDialog,
          useValue: mockDeep<MatDialog>(),
        },
        {
          provide: LateralDrawerService,
          useValue: {
            open: jest.fn().mockReturnValue(of(void 0)),
            close: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    lateralDrawerService = TestBed.inject(LateralDrawerService);
    service = TestBed.inject(PurchaseOrderService);
    lateralDrawerService = TestBed.inject(LateralDrawerService);
    matDialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(PurchaseOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should fetch data on init and update dateSource', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.dataSource$.value).toEqual(mockPurchaseOrderListItems);
    }));
    it('should fetch data on init and update totalItems', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.itemsNumber).toEqual(mockPurchaseOrderListItems.length);
    }));
    it('should handle error when purchase order data fails', fakeAsync(() => {
      //Arrange
      jest
        .spyOn(service, 'searchWithFiltersAsync')
        .mockReturnValueOnce(throwError(() => new Error('Error feching data')));
      //Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.dataSource$.value).toEqual([]);
    }));
    it('should set loading to false when data is fetched', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      //Act
      component.ngOnInit();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.isLoading).toBe(false);
    }));
    it('should set loading to false when error occurs', fakeAsync(() => {
      //Arrange
      jest
        .spyOn(service, 'searchWithFiltersAsync')
        .mockReturnValueOnce(throwError(() => new Error('Error feching data')));
      //Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.isLoading).toBe(false);
    }));
    it('should return an empty array when error occurs', fakeAsync(() => {
      //Arrange
      jest
        .spyOn(service, 'searchWithFiltersAsync')
        .mockReturnValueOnce(throwError(() => new Error('Error feching data')));
      //Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.dataSource$.value).toEqual([]);
    }));
  });
  describe('handlePageChange', () => {
    it('should update pageIndex doSearchSubject$', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      const event = { pageIndex: 1, pageSize: 20 };

      //Act
      component.handlePageChange(event);

      //Assert
      expect(component.pageIndex).toBe(1);
    });
    it('should update pageSize doSearchSubject$', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      const event = { pageIndex: 1, pageSize: 20 };

      //Act
      component.handlePageChange(event);

      //Assert
      expect(component.pageSize).toBe(20);
    });
    it('should call doSearchSubject$ when page changes', () => {
      //Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      const event = { pageIndex: 1, pageSize: 20 };

      //Act
      component.handlePageChange(event);

      //Assert
      expect(spy).toHaveBeenCalledWith();
    });
  });
  describe('onSearchTextChange', () => {
    it('should fetch purchase orders and update dataSourse$ when search text changes', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      component.ngOnInit();
      component.pageIndex = 2;
      component.searchText = 'test';

      //Act
      component.onSearchTextChange();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.dataSource$.value).toEqual(mockPurchaseOrderListItems);
    }));
    it('should update pageIndex to 0 when search text changes', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      component.ngOnInit();
      component.pageIndex = 2;
      component.searchText = 'test';

      //Act
      component.onSearchTextChange();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.pageIndex).toBe(0);
    }));
    it('should update itemsNumber when search text changes', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'searchWithFiltersAsync').mockReturnValue(
        of({
          total: mockPurchaseOrderListItems.length,
          results: mockPurchaseOrderListItems,
        }),
      );
      component.ngOnInit();
      component.pageIndex = 2;
      component.searchText = 'test';

      //Act
      component.onSearchTextChange();
      tick(1100);
      fixture.detectChanges();

      //Assert
      expect(component.itemsNumber).toBe(mockPurchaseOrderListItems.length);
    }));
    it('should clear searchText and trigger search when onClearSearch is called', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      component.searchText = 'test';

      //Act
      component.onClearSearch();

      //Assert
      expect(component.searchText).toBe('');
    });
  });
  describe('onCreationDateRangeChange', () => {
    it('should set pageIndex to 0 when creation date range changes', () => {
      //Arrange
      component.pageIndex = 2;
      component.selectedCreationDateRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
      };

      //Act
      component.onCreationDateRangeChange();

      //Assert
      expect(component.pageIndex).toBe(0);
    });
    it('should call doSearchSubject$ when creation date range changes', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      component.selectedCreationDateRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
      };

      //Act
      component.onCreationDateRangeChange();

      //Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalledWith();
    });
  });
  describe('onEstimatedDeliveryDateRangeChange', () => {
    it('should set pageIndex to 0 when estimated delivery date range changes', () => {
      //Arrange
      component.pageIndex = 2;
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
      };

      //Act
      component.onEstimatedDeliveryDateRangeChange();

      //Assert
      expect(component.pageIndex).toBe(0);
    });
    it('should call doSearchSubject$ when estimated delivery date range changes', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
      };

      //Act
      component.onEstimatedDeliveryDateRangeChange();

      //Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalledWith();
    });
  });
  describe('onStatusFilterChange', () => {
    it('should set pageIndex to 0 when status filter changes', () => {
      //Arrange
      component.pageIndex = 2;
      component.selectedStatus = ['Pending'];

      //Act
      component.onStatusFilterChange();

      //Assert
      expect(component.pageIndex).toBe(0);
    });
    it('should call doSearchSubject$ when status filter changes', () => {
      //Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      component.selectedStatus = ['Pending'];

      //Act
      component.onStatusFilterChange();

      //Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalledWith();
    });
  });
  describe('onOrderByChange', () => {
    it('should set pageIndex to 0 when order by changes', () => {
      //Arrange
      const mockOrderBy: {
        label: string;
        field: PurchaseOrderOrderField;
        direction: OrderDirection;
      } = {
        label: 'Created At - asc',
        field: PurchaseOrderOrderField.CreatedAt,
        direction: OrderDirection.ASC,
      };
      component.pageIndex = 2;
      component.selectedOrderBy = mockOrderBy;

      //Act
      component.onOrderByChange(mockOrderBy);

      //Assert
      expect(component.pageIndex).toBe(0);
    });
    it('should call doSearchSubject$ when order by changes', () => {
      //Arrange
      const mockOrderBy: {
        label: string;
        field: PurchaseOrderOrderField;
        direction: OrderDirection;
      } = {
        label: 'Created At - asc',
        field: PurchaseOrderOrderField.CreatedAt,
        direction: OrderDirection.ASC,
      };
      jest.spyOn(component.doSearchSubject$, 'next');
      component.selectedOrderBy = mockOrderBy;

      //Act
      component.onOrderByChange(mockOrderBy);

      //Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalledWith();
    });
  });
  describe('mapStatusToPillStatus', () => {
    it('should return PillStatusEnum.Initial for Draft status', () => {
      // Arrange
      const status = PurchaseOrderStatusOptions.Draft;

      // Act
      const result = component.mapStatusToPillStatus(status);

      // Assert
      expect(result).toBe(PillStatusEnum.Initial);
    });

    it('should return PillStatusEnum.Cancelled for Cancelled status', () => {
      // Arrange
      const status = PurchaseOrderStatusOptions.Cancelled;

      // Act
      const result = component.mapStatusToPillStatus(status);

      // Assert
      expect(result).toBe(PillStatusEnum.Cancelled);
    });

    it('should return PillStatusEnum.Done for Ordered status', () => {
      // Arrange
      const status = PurchaseOrderStatusOptions.Ordered;

      // Act
      const result = component.mapStatusToPillStatus(status);

      // Assert
      expect(result).toBe(PillStatusEnum.InProgress);
    });

    it('should return PillStatusEnum.Done for Received status', () => {
      // Arrange
      const status = PurchaseOrderStatusOptions.Received;

      // Act
      const result = component.mapStatusToPillStatus(status);

      // Assert
      expect(result).toBe(PillStatusEnum.Done);
    });

    it('should return PillStatusEnum.Initial for unknown status', () => {
      // Arrange
      const status = 'UNKNOWN_STATUS' as PurchaseOrderStatusOptions;

      // Act
      const result = component.mapStatusToPillStatus(status);

      // Assert
      expect(result).toBe(PillStatusEnum.Initial);
    });
  });

  describe('confirmDelete', () => {
    beforeEach(() => {
      jest.spyOn(matDialog, 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<unknown, boolean>);

      jest
        .spyOn(service, 'deletePurchaseOrderAsync')
        .mockReturnValue(of(void 0));
    });

    it('should open the confirmation dialog', () => {
      // Arrange
      const row = mockDeep<PurchaseOrderItem>({ id: 123 });

      // Act
      component.confirmDelete(row);

      // Assert
      expect(matDialog.open).toHaveBeenCalled();
    });

    it('should call deletePurchaseOrderAsync with the row id', () => {
      // Arrange
      const row = mockDeep<PurchaseOrderItem>({ id: 123 });

      // Act
      component.confirmDelete(row);

      // Assert
      expect(service.deletePurchaseOrderAsync).toHaveBeenCalledWith(123);
    });

    it('should set isLoading to true', () => {
      // Arrange
      const row = mockDeep<PurchaseOrderItem>({ id: 123 });

      // Act
      component.confirmDelete(row);

      // Assert
      expect(component.isLoading).toBe(true);
    });

    it('should not call deletePurchaseOrderAsync on modal cancel', () => {
      // Arrange
      const row = mockDeep<PurchaseOrderItem>({ id: 123 });
      jest.spyOn(matDialog, 'open').mockReturnValue(
        mockDeep<MatDialogRef<unknown, unknown>>({
          afterClosed: () => of(false),
        }),
      );

      // Act
      component.confirmDelete(row);

      // Assert
      expect(service.deletePurchaseOrderAsync).not.toHaveBeenCalled();
    });
  });

  describe('onDetailDrawer', () => {
    it('should open drawer with productId and correct config', () => {
      //Arrange
      const openSpy = jest.spyOn(lateralDrawerService, 'open');

      // Act
      component.onDetailDrawer(mockPurchaseOrderListItems[0]);

      // Assert
      expect(openSpy).toHaveBeenCalledWith(
        DetailLateralDrawerComponent,
        { purchaseOrderId: mockPurchaseOrderListItems[0].id },
        expect.objectContaining({
          title: 'Detalle de Orden',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Cerrar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });

  describe('onExecuteDrawer', () => {
    it('should open drawer with productId and correct config', () => {
      //Arrange
      const openSpy = jest.spyOn(lateralDrawerService, 'open');

      // Act
      component.onExecuteDrawer(mockPurchaseOrderListItems[0]);

      // Assert
      expect(openSpy).toHaveBeenCalledWith(
        ExecuteLateralDrawerComponent,
        { purchaseOrderId: mockPurchaseOrderListItems[0].id },
        expect.objectContaining({
          title: `Ejecutar Orden #${mockPurchaseOrderListItems[0].id}`,
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Ejecutar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });

  describe('openCreatePurchaseOrder', () => {
    it('should navigate to /ordenes-compra/crear when called', () => {
      // Arrange
      const spy = jest.spyOn(component.router, 'navigate');

      // Act
      component.openCreatePurchaseOrder();

      // Assert
      expect(spy).toHaveBeenCalledWith(['/ordenes-compra/crear']);
    });
  });

  describe('onCancelDrawer', () => {
    it('should open the CancelLateralDrawerComponent with correct configuration', () => {
      // Arrange
      const rowItem = mockDeep<PurchaseOrderItem>({ id: 456 });

      // Act
      component.onCancelDrawer(rowItem);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        expect.any(Function),
        { data: rowItem },
        expect.objectContaining({
          title: 'Cancelar Orden',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({ text: 'Confirmar' }),
            secondButton: expect.objectContaining({ text: 'Cancelar' }),
          }),
        }),
      );
    });

    it('should trigger a search after the drawer closes', fakeAsync(() => {
      // Arrange
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');
      const rowItem = mockDeep<PurchaseOrderItem>({ id: 456 });
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(void 0));

      // Act
      component.onCancelDrawer(rowItem);
      tick();

      // Assert
      expect(doSearchSpy).toHaveBeenCalled();
    }));
  });

  describe('onReceptionDrawer', () => {
    it('should open the ReceptionLateralDrawerComponent with correct configuration', () => {
      // Arrange
      const rowItem = mockDeep<PurchaseOrderItem>({ id: 789 });

      // Act
      component.onReceptionDrawer(rowItem);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        expect.any(Function),
        { purchaseOrderId: rowItem.id },
        expect.objectContaining({
          title: 'Recepcionar Orden',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({ text: 'Confirmar' }),
            secondButton: expect.objectContaining({ text: 'Cancelar' }),
          }),
        }),
      );
    });

    it('should trigger a search after the drawer closes', fakeAsync(() => {
      // Arrange
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');
      const rowItem = mockDeep<PurchaseOrderItem>({ id: 789 });
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(void 0));

      // Act
      component.onReceptionDrawer(rowItem);
      tick();

      // Assert
      expect(doSearchSpy).toHaveBeenCalled();
    }));

    it('should close the drawer when cancel button is clicked in reception drawer', () => {
      // Arrange
      const rowItem = mockDeep<PurchaseOrderItem>({ id: 789 });
      const closeSpy = jest.spyOn(lateralDrawerService, 'close');
      let footerConfig:
        | {
            firstButton: { text: string; click: () => void };
            secondButton?: { text: string; click: () => void };
          }
        | undefined;

      jest
        .spyOn(lateralDrawerService, 'open')
        .mockImplementation((_comp, _data, config) => {
          footerConfig = config?.footer;
          return of(void 0);
        });

      // Act
      component.onReceptionDrawer(rowItem);
      footerConfig?.secondButton?.click();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('clearDateFilters', () => {
    it('should clear both date ranges and call applyFilters', () => {
      // Arrange
      const spy = jest.spyOn(component, 'applyFilters');
      component.selectedCreationDateRange = {
        start: new Date(),
        end: new Date(),
      };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date(),
        end: new Date(),
      };

      // Act
      component.clearDateFilters();

      // Assert
      expect(component.selectedCreationDateRange).toEqual({
        start: null,
        end: null,
      });
      expect(component.selectedEstimatedDeliveryDateRange).toEqual({
        start: null,
        end: null,
      });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('applyFilters', () => {
    it('should reset pageIndex and emit doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 5;
      const spy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.applyFilters();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('handleDownloadClick', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call purchaseOrderService.downloadPurchaseOrderList with correct params and trigger file download', () => {
      // Arrange
      const params = component['getPurchaseOrderParams']();
      const mockResponse = new HttpResponse({
        body: new Blob(['test'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        status: 200,
        statusText: 'OK',
      });
      jest
        .spyOn(service, 'downloadPurchaseOrderList')
        .mockReturnValue(of(mockResponse));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(service.downloadPurchaseOrderList).toHaveBeenCalledWith(params);
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockResponse,
        'ordenes_compra.xlsx',
      );
    });

    it('should handle errors from purchaseOrderService.downloadPurchaseOrderList', () => {
      // Arrange
      jest
        .spyOn(service, 'downloadPurchaseOrderList')
        .mockReturnValueOnce(throwError(() => new Error('Download error')));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(downloadFileFromResponse).not.toHaveBeenCalled();
    });
  });

  describe('getPurchaseOrderParams', () => {
    it('should include statusName in filters when selectedStatus is not empty', () => {
      // Arrange
      component.selectedStatus = ['Pending', 'Cancelled'];
      component.selectedCreationDateRange = { start: null, end: null };
      component.selectedEstimatedDeliveryDateRange = { start: null, end: null };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.statusName).toEqual(['Pending', 'Cancelled']);
      expect(params.filters.fromDate).toBeUndefined();
      expect(params.filters.toDate).toBeUndefined();
      expect(params.filters.fromEstimatedDeliveryDate).toBeUndefined();
      expect(params.filters.toEstimatedDeliveryDate).toBeUndefined();
    });

    it('should include fromDate in filters when selectedCreationDateRange.start is set', () => {
      // Arrange
      component.selectedStatus = [];
      component.selectedCreationDateRange = {
        start: new Date('2024-07-01'),
        end: null,
      };
      component.selectedEstimatedDeliveryDateRange = { start: null, end: null };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.fromDate).toEqual(new Date('2024-07-01'));
      expect(params.filters.statusName).toBeUndefined();
      expect(params.filters.toDate).toBeUndefined();
      expect(params.filters.fromEstimatedDeliveryDate).toBeUndefined();
      expect(params.filters.toEstimatedDeliveryDate).toBeUndefined();
    });

    it('should include toDate in filters when selectedCreationDateRange.end is set', () => {
      // Arrange
      component.selectedStatus = [];
      component.selectedCreationDateRange = {
        start: null,
        end: new Date('2024-07-31'),
      };
      component.selectedEstimatedDeliveryDateRange = { start: null, end: null };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.toDate).toEqual(new Date('2024-07-31'));
      expect(params.filters.statusName).toBeUndefined();
      expect(params.filters.fromDate).toBeUndefined();
      expect(params.filters.fromEstimatedDeliveryDate).toBeUndefined();
      expect(params.filters.toEstimatedDeliveryDate).toBeUndefined();
    });

    it('should include fromEstimatedDeliveryDate in filters when selectedEstimatedDeliveryDateRange.start is set', () => {
      // Arrange
      component.selectedStatus = [];
      component.selectedCreationDateRange = { start: null, end: null };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2024-07-05'),
        end: null,
      };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.fromEstimatedDeliveryDate).toEqual(
        new Date('2024-07-05'),
      );
      expect(params.filters.statusName).toBeUndefined();
      expect(params.filters.fromDate).toBeUndefined();
      expect(params.filters.toDate).toBeUndefined();
      expect(params.filters.toEstimatedDeliveryDate).toBeUndefined();
    });

    it('should include toEstimatedDeliveryDate in filters when selectedEstimatedDeliveryDateRange.end is set', () => {
      // Arrange
      component.selectedStatus = [];
      component.selectedCreationDateRange = { start: null, end: null };
      component.selectedEstimatedDeliveryDateRange = {
        start: null,
        end: new Date('2024-07-20'),
      };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.toEstimatedDeliveryDate).toEqual(
        new Date('2024-07-20'),
      );
      expect(params.filters.statusName).toBeUndefined();
      expect(params.filters.fromDate).toBeUndefined();
      expect(params.filters.toDate).toBeUndefined();
      expect(params.filters.fromEstimatedDeliveryDate).toBeUndefined();
    });

    it('should include all filters when all are set', () => {
      // Arrange
      component.selectedStatus = ['Pending'];
      component.selectedCreationDateRange = {
        start: new Date('2024-07-01'),
        end: new Date('2024-07-31'),
      };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2024-07-05'),
        end: new Date('2024-07-20'),
      };

      // Act
      const params = component['getPurchaseOrderParams']();

      // Assert
      expect(params.filters.statusName).toEqual(['Pending']);
      expect(params.filters.fromDate).toEqual(new Date('2024-07-01'));
      expect(params.filters.toDate).toEqual(new Date('2024-07-31'));
      expect(params.filters.fromEstimatedDeliveryDate).toEqual(
        new Date('2024-07-05'),
      );
      expect(params.filters.toEstimatedDeliveryDate).toEqual(
        new Date('2024-07-20'),
      );
    });
  });
  describe('isDateRangeValid', () => {
    it('should return true if creation and estimated ranges are valid', () => {
      // Arrange
      component.selectedCreationDateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2024-02-01'),
        end: new Date('2024-02-28'),
      };
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(true);
    });

    it('should return true if any date in ranges is null', () => {
      // Arrange
      component.selectedCreationDateRange = {
        start: null,
        end: new Date('2024-01-31'),
      };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2024-02-01'),
        end: null,
      };
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(true);
    });

    it('should return false if creation start is after creation end', () => {
      // Arrange
      component.selectedCreationDateRange = {
        start: new Date('2024-02-01'),
        end: new Date('2024-01-01'),
      };
      component.selectedEstimatedDeliveryDateRange = { start: null, end: null };
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(false);
    });

    it('should return false if estimated start is after estimated end', () => {
      // Arrange
      component.selectedCreationDateRange = { start: null, end: null };
      component.selectedEstimatedDeliveryDateRange = {
        start: new Date('2024-03-01'),
        end: new Date('2024-02-01'),
      };
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(false);
    });
  });
});
