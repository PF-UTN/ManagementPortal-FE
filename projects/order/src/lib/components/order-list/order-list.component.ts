import {
  downloadFileFromResponse,
  OrderDirection,
  OrderService,
} from '@Common';
import {
  ColumnTypeEnum,
  TableColumn,
  TableComponent,
  TitleComponent,
  PillStatusEnum,
  InputComponent,
  ButtonComponent,
  LateralDrawerService,
  ModalComponent,
} from '@Common-UI';

import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';

import { OrderItem } from '../../../../../common/src/models/order/order-item-general.model';
import {
  ORDER_LIST_ORDER_OPTIONS,
  OrderListOrderOption,
} from '../../../../../common/src/models/order/order-list-option-order.model';
import {
  OrderOrderField,
  OrderParams,
} from '../../../../../common/src/models/order/order-params.model';
import { OrderSearchResult } from '../../../../../common/src/models/order/order-response-model';
import { statusOptions } from '../../../../../common/src/models/order/order-status-option.model';
import { OrderStatusOptions } from '../../../../../common/src/models/order/order-status.enum';
import { OrderListUtils } from '../../utils/order-list-utils';
import { CreateShipmentDrawerComponent } from '../create-shipment-drawer/create-shipment-drawer.component';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';

@Component({
  selector: 'mp-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    TitleComponent,
    InputComponent,
    FormsModule,
    MatSelectModule,
    ButtonComponent,
    MatMenuModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTooltip,
  ],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  columns: TableColumn<OrderItem>[] = [
    {
      columnDef: 'select',
      header: '',
      type: ColumnTypeEnum.SELECT,
      width: '40px',
      disabled: (order: OrderItem) =>
        order.orderStatus !== OrderStatusOptions.Pending ||
        order.deliveryMethod !== 'Entrega a Domicilio',
    },
    {
      columnDef: 'orderId',
      header: 'NÚMERO DE PEDIDO',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.id.toString(),
    },
    {
      columnDef: 'clientName',
      header: 'NOMBRE DEL CLIENTE',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.clientName,
    },
    {
      columnDef: 'createdAt',
      header: 'FECHA DE CREACIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) =>
        this.datePipe.transform(element.createdAt, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'status',
      header: 'ESTADO',
      type: ColumnTypeEnum.PILL,
      value: (element: OrderItem) => this.getStatusLabel(element.orderStatus),
      pillStatus: (element: OrderItem) =>
        this.mapStatusToPillStatus(element.orderStatus),
    },
    {
      columnDef: 'deliveryMethod',
      header: 'MÉTODO DE ENTREGA',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.deliveryMethod,
    },
    {
      columnDef: 'shipmentId',
      header: 'ENVÍO',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) =>
        element.shipmentId !== null && element.shipmentId !== undefined
          ? `Envío #${element.shipmentId}`
          : 'Sin asignar',
    },
    {
      columnDef: 'price',
      header: 'PRECIO',
      type: ColumnTypeEnum.VALUE,
      value: (item) =>
        this.currencyPipe.transform(
          item.totalAmount,
          'ARS',
          'symbol',
          '1.2-2',
          'es-AR',
        ) ?? '',
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: OrderItem) => this.onDetailDrawer(element),
        },
        {
          description: 'Marcar como preparada',
          action: (element: OrderItem) => this.onMarkAsPrepared(element),
          disabled: (element: OrderItem) =>
            element.orderStatus !== OrderStatusOptions.InPreparation,
        },
        {
          description: 'Marcar como Finalizada',
          action: (element: OrderItem) => this.onMarkAsFinalized(element),
          disabled: (element: OrderItem) =>
            element.orderStatus !== OrderStatusOptions.Prepared ||
            element.deliveryMethod === 'Entrega a Domicilio',
        },
      ],
    },
  ];

  deliveryTypeOptions = [
    { key: 1, value: 'Retiro en Local' },
    { key: 2, value: 'Entrega a Domicilio' },
  ];

  dataSource$ = new BehaviorSubject<OrderItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = false;

  pageIndex: number = 0;
  pageSize: number = 10;
  selectedDeliveryTypes: number[] = [];

  doSearchSubject$ = new Subject<void>();
  searchText: string = '';
  shipmentIdOptions: { key: number; value: string }[] = [
    { key: -2, value: 'Sin asignar' },
  ];
  selectedShipmentId: number = -1;
  allShipmentIds: (number | null)[] = [];

  statusOptions = statusOptions;
  selectedStatuses: { key: OrderStatusOptions; value: string }[] = [];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedStatus: string[] = [];
  orderByOptions = ORDER_LIST_ORDER_OPTIONS;
  selectedOrderBy: OrderListOrderOption = this.orderByOptions[1];
  selectedCreationDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };

  private searchSubscription?: Subscription;

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private orderService: OrderService,
    private lateralDrawerService: LateralDrawerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAllShipmentIds();

    this.searchSubscription = this.doSearchSubject$
      .pipe(
        debounceTime(400),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const shipmentIdFilter: { shipmentId?: number | null } = {};
          if (this.selectedShipmentId === -2) {
            shipmentIdFilter.shipmentId = null;
          } else if (this.selectedShipmentId !== -1) {
            shipmentIdFilter.shipmentId = this.selectedShipmentId;
          }

          const body = {
            searchText: this.searchText ?? '',
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            filters: {
              statusName:
                this.selectedStatus.length > 0
                  ? this.selectedStatus
                  : undefined,
              fromCreatedAtDate: this.fromDate
                ? this.fromDate.toISOString().slice(0, 10)
                : undefined,
              toCreatedAtDate: this.toDate
                ? this.toDate.toISOString().slice(0, 10)
                : undefined,
              deliveryMethodId:
                this.selectedDeliveryTypes.length > 0
                  ? this.selectedDeliveryTypes
                  : undefined,
              ...shipmentIdFilter,
            },
            orderBy: {
              field:
                this.selectedOrderBy.field === 'totalAmount'
                  ? 'totalAmount'
                  : this.selectedOrderBy.field,
              direction: this.selectedOrderBy.direction,
            },
          };

          return this.orderService.searchOrders(body);
        }),
      )
      .subscribe({
        next: (response) => {
          const mapped = response.results.map((r) => this.mapToOrderItem(r));
          this.dataSource$.next(mapped);
          this.itemsNumber = response.total;
          this.updateShipmentIdOptions();
          this.isLoading = false;
        },
        error: () => {
          this.dataSource$.next([]);
          this.itemsNumber = 0;
          this.isLoading = false;
        },
      });

    this.doSearchSubject$.next();
  }
  get isDateRangeValid(): boolean {
    return !this.fromDate || !this.toDate || this.fromDate <= this.toDate;
  }

  loadAllShipmentIds() {
    this.orderService
      .searchOrders({
        searchText: '',
        page: 1,
        pageSize: 100,
        filters: {},
        orderBy: {
          field: 'createdAt',
          direction: 'desc',
        },
      })
      .pipe(catchError(() => of({ results: [] })))
      .subscribe((response) => {
        this.allShipmentIds = Array.from(
          new Set(response.results.map((r) => r.shipmentId)),
        )
          .filter((id) => id !== null)
          .sort((a, b) => (b as number) - (a as number));
        this.updateShipmentIdOptions();
      });
  }

  updateShipmentIdOptions() {
    this.shipmentIdOptions = [
      { key: -2, value: 'Sin asignar' },
      ...this.allShipmentIds
        .filter((id) => id !== null)
        .map((id) => ({ key: id, value: `Envío #${id}` })),
    ];
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getStatusLabel(status: OrderStatusOptions): string {
    return OrderListUtils.getStatusLabel(status);
  }

  mapStatusToPillStatus(status: OrderStatusOptions): PillStatusEnum {
    return OrderListUtils.mapStatusToPillStatus(status);
  }

  onDeliveryTypeFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onShipmentIdFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  private mapToOrderItem(apiResult: OrderSearchResult): OrderItem {
    return {
      id: apiResult.id,
      createdAt: apiResult.createdAt,
      clientName: apiResult.clientName,
      orderStatus:
        this.statusOptions.find(
          (opt) =>
            opt.value.toLowerCase() ===
            (apiResult.orderStatus ?? '').toLowerCase(),
        )?.key ?? OrderStatusOptions.Pending,
      totalAmount: apiResult.totalAmount,
      deliveryMethod: apiResult.deliveryMethod,
      shipmentId: apiResult.shipmentId,
    };
  }

  onApplyDateFilter(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onClearDateFilter(): void {
    this.fromDate = null;
    this.toDate = null;
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  setOrderBy(option: OrderListOrderOption) {
    this.selectedOrderBy = option;
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onStatusFilterChange(): void {
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

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }

  onDetailDrawer(request: OrderItem): void {
    this.lateralDrawerService.open(
      DetailLateralDrawerComponent,
      { orderId: request.id },
      {
        title: 'Detalle Pedido',
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

  private getOrderParams(): OrderParams {
    const params: OrderParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: this.searchText,
      filters: {},
      orderBy: {
        field: this.selectedOrderBy?.field || OrderOrderField.CreatedAt,
        direction: this.selectedOrderBy?.direction || OrderDirection.DESC,
      },
    };

    if (this.selectedStatus.length > 0) {
      params.filters.statusName = this.selectedStatus;
    }

    if (this.fromDate) {
      params.filters.fromCreatedAtDate = this.fromDate
        .toISOString()
        .slice(0, 10);
    }
    if (this.toDate) {
      params.filters.toCreatedAtDate = this.toDate.toISOString().slice(0, 10);
    }

    if (this.selectedDeliveryTypes.length > 0) {
      params.filters.deliveryMethodId = this.selectedDeliveryTypes;
    }

    if (this.selectedShipmentId === -2) {
      params.filters.shipmentId = null;
    } else if (this.selectedShipmentId !== -1) {
      params.filters.shipmentId = this.selectedShipmentId;
    }
    return params;
  }

  handleDownloadClick(): void {
    const params = this.getOrderParams();
    this.orderService.downloadOrderList(params).subscribe((response) => {
      downloadFileFromResponse(response, 'pedidos.xlsx');
    });
  }

  get hasSelectedOrders(): boolean {
    return this.dataSource$.value.some((order) => order.selected);
  }

  onCreateShipment() {
    const selectedOrders = this.dataSource$.value.filter(
      (order) => order.selected,
    );

    this.lateralDrawerService
      .open(
        CreateShipmentDrawerComponent,
        { selectedOrders },
        {
          title: 'Crear Envío',
          size: 'small',
          footer: {
            firstButton: {
              text: 'Crear',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => this.lateralDrawerService.close(),
            },
          },
        },
      )
      .subscribe(() => {
        this.doSearchSubject$.next();
        this.loadAllShipmentIds();
      });
  }

  get selectedOrderIds(): number[] {
    return this.dataSource$.value
      .filter((order) => order.selected)
      .map((order) => order.id);
  }

  onMarkAsPrepared(order: OrderItem) {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Preparar orden #' + order.id,
        message: '¿Estas seguro que deseas marcar esta orden como preparada?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isLoading = true;
        this.orderService.markOrderAs(order.id, 6).subscribe({
          next: () => {
            this.snackBar.open('Orden preparada con éxito', 'Cerrar', {
              duration: 3000,
            });
            this.doSearchSubject$.next();
            this.loadAllShipmentIds();
          },
          error: () => {
            this.snackBar.open('Error al preparar la orden', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  onMarkAsFinalized(order: OrderItem) {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Finalizar orden #' + order.id,
        message: '¿Estas seguro que deseas marcar esta orden como finalizada?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isLoading = true;
        this.orderService.markOrderAs(order.id, 4).subscribe({
          next: () => {
            this.snackBar.open('Orden finalizada con éxito', 'Cerrar', {
              duration: 3000,
            });
            this.doSearchSubject$.next();
            this.loadAllShipmentIds();
          },
          error: () => {
            this.snackBar.open('Error al preparar la orden', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
