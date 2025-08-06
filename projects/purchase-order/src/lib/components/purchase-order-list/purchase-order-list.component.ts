import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import { PurchaseOrderParams } from '../../models/purchase-order-param.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'mp-purchase-order-list',
  standalone: true,
  imports: [
    TableComponent,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    InputComponent,
    ButtonComponent,
  ],
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
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.purchaseOrderStatusName,
    },
    {
      columnDef: 'createdAt',
      header: 'FECHA DE CREACIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) => element.createdAt.toString(),
    },
    {
      columnDef: 'effectiveDeliveryDate',
      header: 'FECHA DE ENTREGA',
      type: ColumnTypeEnum.VALUE,
      value: (element: PurchaseOrderItem) =>
        element.effectiveDeliveryDate?.toString() || '',
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
          action: (element: PurchaseOrderItem) =>
            console.log('Ver Detalle', element),
        },
        {
          description: 'Modificar',
          action: (element: PurchaseOrderItem) =>
            console.log('Modificar', element),
        },
        {
          description: 'Eliminar',
          action: (element: PurchaseOrderItem) =>
            console.log('Eliminar', element),
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

  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

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
          };
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

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
