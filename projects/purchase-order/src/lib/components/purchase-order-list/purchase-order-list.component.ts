import { OrderDirection, downloadFileFromResponse } from '@Common';
import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  LateralDrawerService,
  ModalComponent,
  ModalConfig,
  PillStatusEnum,
  TableColumn,
  TableComponent,
  TitleComponent,
} from '@Common-UI';

import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import {
  PurchaseOrderStatusEnabledForCancelled,
  PurchaseOrderStatusEnabledForDeletion,
  PurchaseOrderStatusEnabledForExecution,
  PurchaseOrderStatusEnabledForModification,
  PurchaseOrderStatusEnabledForReception,
  PurchaseOrderStatusOptions,
} from '../../constants/purchase-order-status.enum';
import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import {
  PurchaseOrderOrderField,
  PurchaseOrderOrderOption,
  PurchaseOrderParams,
} from '../../models/purchase-order-param.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { CancelLateralDrawerComponent } from '../cancel-lateral-drawer/cancel-lateral-drawer.component';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';
import { ExecuteLateralDrawerComponent } from '../execute-lateral-drawer/execute-lateral-drawer.component';
import { ReceptionLateralDrawerComponent } from '../reception-lateral-drawer/reception-lateral-drawer.component';

@Component({
  selector: 'mp-purchase-order-list',
  standalone: true,
  imports: [
    MatIconModule,
    TableComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    InputComponent,
    ButtonComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    TitleComponent,
  ],
  providers: [DatePipe],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss',
})
export class PurchaseOrderListComponent implements OnInit {
  columns: TableColumn<PurchaseOrderItem>[] = [
    {
      columnDef: 'id',
      header: 'NÚMERO',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.id.toString(),
      width: '50px',
    },
    {
      columnDef: 'supplierBussinesName',
      header: 'PROVEEDOR',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.supplierBussinesName,
      width: '500px',
    },
    {
      columnDef: 'purchaseOrderStatusName',
      header: 'ESTADO',
      type: ColumnTypeEnum.PILL,
      value: (element: PurchaseOrderItem) => element.purchaseOrderStatusName,
      pillStatus: (element: PurchaseOrderItem) =>
        this.mapStatusToPillStatus(
          element.purchaseOrderStatusName as PurchaseOrderStatusOptions,
        ),
      width: '250px',
    },
    {
      columnDef: 'createdAt',
      header: 'FECHA DE CREACIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) =>
        this.datePipe.transform(element.createdAt, 'dd/MM/yyyy')!,
      width: '250px',
    },
    {
      columnDef: 'estimatedDeliveryDate',
      header: 'FECHA ESTIMADA',
      type: ColumnTypeEnum.VALUE,
      width: '225px',
      value: (element: PurchaseOrderItem) =>
        this.datePipe.transform(element.estimatedDeliveryDate, 'dd/MM/yyyy') ||
        'N/A',
    },
    {
      columnDef: 'effectiveDeliveryDate',
      header: 'FECHA EFECTIVA',
      type: ColumnTypeEnum.VALUE,
      width: '225px',
      value: (element: PurchaseOrderItem) =>
        this.datePipe.transform(element.effectiveDeliveryDate, 'dd/MM/yyyy') ||
        'N/A',
    },
    {
      columnDef: 'totalAmount',
      header: 'TOTAL',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) =>
        new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(element.totalAmount),
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      width: '100px',
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: PurchaseOrderItem) => this.onDetailDrawer(element),
        },
        {
          description: 'Modificar',
          disabled: (element: PurchaseOrderItem) =>
            !PurchaseOrderStatusEnabledForModification.includes(
              element.purchaseOrderStatusName,
            ),
          action: (element: PurchaseOrderItem) =>
            this.router.navigate([`/ordenes-compra/modificar/${element.id}`]),
        },
        {
          description: 'Eliminar',
          disabled: (element: PurchaseOrderItem) =>
            !PurchaseOrderStatusEnabledForDeletion.includes(
              element.purchaseOrderStatusName,
            ),
          action: (element: PurchaseOrderItem) => this.confirmDelete(element),
        },
        {
          description: 'Cancelar',
          disabled: (element: PurchaseOrderItem) =>
            !PurchaseOrderStatusEnabledForCancelled.includes(
              element.purchaseOrderStatusName,
            ),
          action: (element: PurchaseOrderItem) => this.onCancelDrawer(element),
        },
        {
          description: 'Ejecutar',
          disabled: (element: PurchaseOrderItem) =>
            !PurchaseOrderStatusEnabledForExecution.includes(
              element.purchaseOrderStatusName,
            ),
          action: (element: PurchaseOrderItem) => this.onExecuteDrawer(element),
        },
        {
          description: 'Recepcionar',
          disabled: (element: PurchaseOrderItem) =>
            !PurchaseOrderStatusEnabledForReception.includes(
              element.purchaseOrderStatusName,
            ),
          action: (element: PurchaseOrderItem) =>
            this.onReceptionDrawer(element),
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<PurchaseOrderItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;
  selectedStatuses: string[] = [];
  doSearchSubject$ = new Subject<void>();
  searchText: string = '';
  selectedStatus: string[] = [];
  selectedEstimatedDeliveryDateRange: { start: Date | null; end: Date | null } =
    {
      start: null,
      end: null,
    };
  selectedCreationDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  statusOptions = PurchaseOrderStatusOptions;
  orderByOptions: PurchaseOrderOrderOption[] = [
    {
      label: 'Fecha Creación: Ascendente',
      field: PurchaseOrderOrderField.CreatedAt,
      direction: OrderDirection.ASC,
    },
    {
      label: 'Fecha Creación: Descendente',
      field: PurchaseOrderOrderField.CreatedAt,
      direction: OrderDirection.DESC,
    },
    {
      label: 'Total: Menor a Mayor',
      field: PurchaseOrderOrderField.totalAmount,
      direction: OrderDirection.ASC,
    },
    {
      label: 'Total: Mayor a Menor',
      field: PurchaseOrderOrderField.totalAmount,
      direction: OrderDirection.DESC,
    },
  ];
  selectedOrderBy: {
    label: string;
    field: PurchaseOrderOrderField;
    direction: OrderDirection;
  } | null = null;

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly datePipe: DatePipe,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly lateralDrawerService: LateralDrawerService,
    public readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params = this.getPurchaseOrderParams();
          return this.purchaseOrderService.searchWithFiltersAsync(params);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dataSource$.next(response.results);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al obtener los datos:', error);
          this.isLoading = false;
        },
      });
    this.doSearchSubject$.next();
  }

  private getPurchaseOrderParams(): PurchaseOrderParams {
    const params: PurchaseOrderParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: this.searchText,
      filters: {},
      orderBy: {
        field: this.selectedOrderBy?.field || PurchaseOrderOrderField.CreatedAt,
        direction: this.selectedOrderBy?.direction || OrderDirection.ASC,
      },
    };

    if (this.selectedStatus.length > 0) {
      params.filters.statusName = this.selectedStatus;
    }
    if (this.selectedCreationDateRange.start) {
      params.filters.fromDate = this.selectedCreationDateRange.start;
    }
    if (this.selectedCreationDateRange.end) {
      params.filters.toDate = this.selectedCreationDateRange.end;
    }
    if (this.selectedEstimatedDeliveryDateRange.start) {
      params.filters.fromEstimatedDeliveryDate =
        this.selectedEstimatedDeliveryDateRange.start;
    }
    if (this.selectedEstimatedDeliveryDateRange.end) {
      params.filters.toEstimatedDeliveryDate =
        this.selectedEstimatedDeliveryDateRange.end;
    }
    return params;
  }

  onEstimatedDeliveryDateRangeChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onCreationDateRangeChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onSearchTextChange(): void {
    this.pageIndex = 0;
    this.isLoading = true;
    this.doSearchSubject$.next();
  }

  onClearSearch() {
    this.searchText = '';
    this.onSearchTextChange();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onOrderByChange(option: PurchaseOrderOrderOption): void {
    this.selectedOrderBy = option;
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onDetailDrawer(request: PurchaseOrderItem): void {
    this.lateralDrawerService.open(
      DetailLateralDrawerComponent,
      { purchaseOrderId: request.id },
      {
        title: 'Detalle Orden de Compra',
        footer: {
          firstButton: {
            text: 'Cerrar',
            click: () => this.lateralDrawerService.close(),
          },
        },
        size: 'medium',
      },
    );
  }

  onExecuteDrawer(request: PurchaseOrderItem): void {
    this.lateralDrawerService
      .open(
        ExecuteLateralDrawerComponent,
        { purchaseOrderId: request.id },
        {
          title: `Ejecutar Orden #${request.id}`,
          footer: {
            firstButton: {
              text: 'Ejecutar',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => {
                this.lateralDrawerService.close();
              },
            },
          },
          size: 'small',
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  clearDateFilters(): void {
    this.selectedCreationDateRange = { start: null, end: null };
    this.selectedEstimatedDeliveryDateRange = { start: null, end: null };
    this.applyFilters();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }

  mapStatusToPillStatus(status: PurchaseOrderStatusOptions): PillStatusEnum {
    switch (status) {
      case PurchaseOrderStatusOptions.Draft:
        return PillStatusEnum.Initial;
      case PurchaseOrderStatusOptions.Ordered:
        return PillStatusEnum.InProgress;
      case PurchaseOrderStatusOptions.Received:
        return PillStatusEnum.Done;
      case PurchaseOrderStatusOptions.Cancelled:
        return PillStatusEnum.Cancelled;
      default:
        return PillStatusEnum.Initial;
    }
  }

  confirmDelete(row: PurchaseOrderItem) {
    const config: ModalConfig = {
      title: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar esta Orden de Compra?',
      confirmText: 'Sí, eliminar',
      cancelText: 'No',
    };

    const dialogRef = this.dialog.open(ModalComponent, {
      data: config,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.purchaseOrderService.deletePurchaseOrderAsync(row.id).subscribe({
          next: () => {
            this.snackBar.open(
              'Orden de Compra eliminada correctamente',
              'Cerrar',
              {
                duration: 5000,
              },
            );
            this.doSearchSubject$.next();
          },
        });
      }
    });
  }

  openCreatePurchaseOrder() {
    this.router.navigate(['/ordenes-compra/crear']);
  }

  onCancelDrawer(rowItem: PurchaseOrderItem): void {
    this.lateralDrawerService
      .open(
        CancelLateralDrawerComponent,
        { data: rowItem },
        {
          title: 'Cancelar Orden de Compra',
          footer: {
            firstButton: {
              text: 'Confirmar',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => {
                this.lateralDrawerService.close();
              },
            },
          },
          size: 'small',
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  onReceptionDrawer(rowItem: PurchaseOrderItem): void {
    this.lateralDrawerService
      .open(
        ReceptionLateralDrawerComponent,
        { purchaseOrderId: rowItem.id },
        {
          title: 'Recepcionar Orden de Compra',
          footer: {
            firstButton: {
              text: 'Confirmar',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => {
                this.lateralDrawerService.close();
              },
            },
          },
          size: 'small',
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  handleDownloadClick(): void {
    const params = this.getPurchaseOrderParams();

    this.purchaseOrderService
      .downloadPurchaseOrderList(params)
      .subscribe((response) => {
        downloadFileFromResponse(response, 'ordenes_compra.xlsx');
      });
  }
}
