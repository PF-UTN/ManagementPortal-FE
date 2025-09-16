import {
  ColumnTypeEnum,
  TableColumn,
  TableComponent,
  TitleComponent,
} from '@Common-UI';

import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { OrderItem } from '../../models/order-item.model';

@Component({
  selector: 'mp-order-list-client',
  standalone: true,
  imports: [TableComponent, TitleComponent],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './order-list-client.component.html',
  styleUrl: './order-list-client.component.scss',
})
export class OrderListClientComponent implements OnInit {
  columns: TableColumn<OrderItem>[] = [
    {
      columnDef: 'orderId',
      header: 'Número de orden',
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
      value: (element: OrderItem) => element.status,
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

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) {}

  ngOnInit(): void {}

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
