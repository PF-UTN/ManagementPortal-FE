import { OrderDirection } from '@Common';
import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  ModalComponent,
  ModalConfig,
  LateralDrawerService,
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
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import {
  PurchaseOrderStatusEnabledForDeletion,
  PurchaseOrderStatusOptions,
} from '../../constants/purchase-order-status.enum';
import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import {
  PurchaseOrderOrderField,
  PurchaseOrderOrderOption,
  PurchaseOrderParams,
} from '../../models/purchase-order-param.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';

@Component({
  selector: 'mp-purchase-order-list',
  standalone: true,
  imports: [
    TableComponent,
    FormsModule,
    CommonModule,
    MatIconModule,
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
    },
    {
      columnDef: 'supplierBussinesName',
      header: 'PROVEEDOR',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.supplierBussinesName,
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
      width: '150px',
    },
    {
      columnDef: 'createdAt',
      header: 'FECHA DE CREACIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) =>
        this.datePipe.transform(element.createdAt, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'deliveryDates',
      header: 'FECHA DE ENTREGA',
      type: ColumnTypeEnum.MULTI_VALUE,
      width: '200px',
      multiValue: (element: PurchaseOrderItem) => [
        `Fecha Estimada: ${this.datePipe.transform(element.estimatedDeliveryDate, 'dd/MM/yyyy') || 'N/A'}`,
        `Fecha Efectiva: ${this.datePipe.transform(element.effectiveDeliveryDate, 'dd/MM/yyyy') || 'N/A'}`,
      ],
    },
    {
      columnDef: 'totalAmount',
      header: 'TOTAL',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.totalAmount.toString(),
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: PurchaseOrderItem) => this.onDetailDrawer(element),
        },
        {
          description: 'Modificar',
          action: (element: PurchaseOrderItem) =>
            console.log('Modificar', element),
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
          action: (element: PurchaseOrderItem) =>
            console.log('Cancelar', element),
        },
        {
          description: 'Ejecutar',
          action: (element: PurchaseOrderItem) =>
            console.log('Ejecutar', element),
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
      label: 'Fecha de Creación - Ascendente',
      field: PurchaseOrderOrderField.CreatedAt,
      direction: OrderDirection.ASC,
    },
    {
      label: 'Fecha de Creación - Descendente',
      field: PurchaseOrderOrderField.CreatedAt,
      direction: OrderDirection.DESC,
    },
    {
      label: 'Total - Ascendente',
      field: PurchaseOrderOrderField.totalAmount,
      direction: OrderDirection.ASC,
    },
    {
      label: 'Total - Descendente',
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
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params: PurchaseOrderParams = {
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            searchText: this.searchText,
            filters: {},
            orderBy: {
              field: PurchaseOrderOrderField.CreatedAt,
              direction: OrderDirection.ASC,
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

          if (this.selectedOrderBy) {
            params.orderBy.field = this.selectedOrderBy.field;
            params.orderBy.direction = this.selectedOrderBy.direction;
          }
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

  onEstimatedDeliveryDateRangeChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onCreationDateRangeChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onOrderByChange(): void {
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
      },
    );
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
}
