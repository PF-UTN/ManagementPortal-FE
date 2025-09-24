import {
  ColumnTypeEnum,
  TableColumn,
  TableComponent,
  TitleComponent,
  PillStatusEnum,
  SubtitleComponent,
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
import { BehaviorSubject, Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { OrderClientSearchResult } from '../../models/order-client-response.model';
import { OrderItem } from '../../models/order-item.model';
import {
  ORDER_LIST_ORDER_OPTIONS,
  OrderListOrderOption,
} from '../../models/order-list-option-order.model';
import { statusOptions } from '../../models/order-status-option.model';
import { OrderStatusOptions } from '../../models/order-status.enum';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'mp-order-list-client',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    TitleComponent,
    SubtitleComponent,
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
  templateUrl: './order-list-client.component.html',
  styleUrl: './order-list-client.component.scss',
})
export class OrderListClientComponent implements OnInit {
  columns: TableColumn<OrderItem>[] = [
    {
      columnDef: 'orderId',
      header: 'Número de pedido',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.id.toString(),
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
      value: (element: OrderItem) => this.getStatusLabel(element.status),
      pillStatus: (element: OrderItem) =>
        this.mapStatusToPillStatus(element.status),
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
      columnDef: 'quantityProducts',
      header: 'Cantidad de productos',
      type: ColumnTypeEnum.VALUE,
      value: (element: OrderItem) => element.quantityProducts.toString(),
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
        {
          description: 'Repetir pedido',
          action: (element: OrderItem) => this.onRepeatOrder(element),
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
  orderByOptions = ORDER_LIST_ORDER_OPTIONS;
  selectedOrderBy: OrderListOrderOption = this.orderByOptions[0];

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
          const token = localStorage.getItem('token');
          const body = {
            searchText: this.searchText ?? '',
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            filters: {
              statusName:
                this.selectedStatuses.length > 0
                  ? this.selectedStatuses.map((s) => s.key)
                  : undefined,
              fromDate: this.fromDate
                ? this.fromDate.toISOString().slice(0, 10)
                : undefined,
              toDate: this.toDate
                ? this.toDate.toISOString().slice(0, 10)
                : undefined,
            },
            orderBy: {
              field:
                this.selectedOrderBy.field === 'price'
                  ? 'totalAmount'
                  : this.selectedOrderBy.field,
              direction: this.selectedOrderBy.direction,
            },
          };
          return token
            ? this.orderService.searchClientOrders(body, token)
            : of({ results: [], total: 0 });
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

    // Primera carga
    this.doSearchSubject$.next();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getStatusLabel(status: OrderStatusOptions): string {
    switch (status) {
      case OrderStatusOptions.Pending:
        return 'Pendiente';
      case OrderStatusOptions.InPreparation:
        return 'En preparación';
      case OrderStatusOptions.Shipped:
        return 'Enviado';
      case OrderStatusOptions.Delivered:
        return 'Entregado';
      case OrderStatusOptions.Cancelled:
        return 'Cancelado';
      case OrderStatusOptions.Returned:
        return 'Devuelto';
      default:
        return 'Pendiente';
    }
  }

  mapStatusToPillStatus(status: OrderStatusOptions): PillStatusEnum {
    switch (status) {
      case OrderStatusOptions.Pending:
        return PillStatusEnum.Initial;
      case OrderStatusOptions.InPreparation:
        return PillStatusEnum.InProgress;
      case OrderStatusOptions.Shipped:
        return PillStatusEnum.InProgress;
      case OrderStatusOptions.Delivered:
        return PillStatusEnum.Done;
      case OrderStatusOptions.Cancelled:
        return PillStatusEnum.Cancelled;
      case OrderStatusOptions.Returned:
        return PillStatusEnum.Warning;
      default:
        return PillStatusEnum.Initial;
    }
  }

  private mapToOrderItem(apiResult: OrderClientSearchResult): OrderItem {
    return {
      id: apiResult.id,
      createdAt: apiResult.createdAt,
      status:
        this.statusOptions.find(
          (opt) =>
            opt.value.toLowerCase() ===
            (apiResult.orderStatusName ?? '').toLowerCase(),
        )?.key ?? OrderStatusOptions.Pending,
      totalAmount: apiResult.totalAmount,
      quantityProducts: apiResult.productsCount,
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

  onRepeatOrder(order: OrderItem) {
    console.log('Repetir pedido', order);
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
}
