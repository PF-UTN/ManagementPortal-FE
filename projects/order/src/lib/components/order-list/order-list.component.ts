import {
  downloadFileFromResponse,
  OrderDirection,
  OrderListUtils,
} from '@Common';
import {
  ColumnTypeEnum,
  TableColumn,
  TableComponent,
  TitleComponent,
  PillStatusEnum,
  InputComponent,
  ButtonComponent,
} from '@Common-UI';

import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { OrderItem } from '../../models/order-item-general.model';
import {
  ORDER_LIST_ORDER_OPTIONS,
  OrderListOrderOption,
} from '../../models/order-list-option-order.model';
import { OrderOrderField, OrderParams } from '../../models/order-params.model';
import { OrderSearchResult } from '../../models/order-response-model';
import { statusOptions } from '../../models/order-status-option.model';
import { OrderStatusOptions } from '../../models/order-status.enum';
import { OrderService } from '../../services/order.service';

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
  ],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  columns: TableColumn<OrderItem>[] = [
    {
      columnDef: 'orderId',
      header: 'Número de pedido',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.id.toString(),
    },
    {
      columnDef: 'clientName',
      header: 'Nombre del cliente',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.clientName,
    },
    {
      columnDef: 'createdAt',
      header: 'Fecha de creación',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) =>
        this.datePipe.transform(element.createdAt, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'status',
      header: 'Estado',
      type: ColumnTypeEnum.PILL,
      value: (element: OrderItem) => this.getStatusLabel(element.orderStatus),
      pillStatus: (element: OrderItem) =>
        this.mapStatusToPillStatus(element.orderStatus),
    },
    {
      columnDef: 'price',
      header: 'Precio',
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
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: OrderItem) => this.onDetailDrawer(element),
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<OrderItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = false;

  pageIndex: number = 0;
  pageSize: number = 10;

  doSearchSubject$ = new Subject<void>();
  searchText: string = '';

  statusOptions = statusOptions;
  selectedStatuses: { key: OrderStatusOptions; value: string }[] = [];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedStatus: string[] = [];
  orderByOptions = ORDER_LIST_ORDER_OPTIONS;
  selectedOrderBy: OrderListOrderOption = this.orderByOptions[0];
  selectedCreationDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };

  private searchSubscription?: Subscription;

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.doSearchSubject$
      .pipe(
        debounceTime(400),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
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

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getStatusLabel(status: OrderStatusOptions): string {
    return OrderListUtils.getStatusLabel(status);
  }

  mapStatusToPillStatus(status: OrderStatusOptions): PillStatusEnum {
    return OrderListUtils.mapStatusToPillStatus(status);
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

  onDetailDrawer(order: OrderItem) {
    console.log('Ver detalle de la orden', order);
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
    return params;
  }

  handleDownloadClick(): void {
    const params = this.getOrderParams();
    this.orderService.downloadOrderList(params).subscribe((response) => {
      downloadFileFromResponse(response, 'pedidos.xlsx');
    });
  }
}
