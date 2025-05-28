import {
  ColumnTypeEnum,
  LateralDrawerService,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { StatesProduct } from '../../constants/state.enum';
import { ProductListItem } from '../../models/product-item.model';
import { ProductParams } from '../../models/product-param.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'mp-product-list',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  columns: TableColumn<ProductListItem>[] = [
    {
      columnDef: 'name',
      header: 'Nombre',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.name,
    },
    {
      columnDef: 'description',
      header: 'Descripción',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.description,
    },
    {
      columnDef: 'supplier',
      header: 'Proveedor',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.supplier,
    },
    {
      columnDef: 'stock',
      header: 'Stock',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.stock.toString(),
    },
    {
      columnDef: 'category',
      header: 'Categoría',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.category,
    },
    {
      columnDef: 'price',
      header: 'Precio',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.price.toFixed(2),
    },
    {
      columnDef: 'enabled',
      header: 'Pausado',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => (element.enabled ? 'Sí' : 'No'),
    },
  ];

  dataSource$ = new BehaviorSubject<ProductListItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;
  selectedCategory: string[] = [];
  selectedEnabled: boolean | null = null;
  selectedSupplier: string[] = [];
  stateProduct = StatesProduct;
  doSearchSubject$ = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(300),
        tap(() => (this.isLoading = true)),
        switchMap(() => {
          const params: ProductParams = {
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            searchText: '',
            filters: {},
          };
          if (this.selectedCategory && this.selectedCategory.length > 0) {
            params.filters = { category: this.selectedCategory };
          }
          if (this.selectedSupplier && this.selectedSupplier.length > 0) {
            params.filters = {
              ...params.filters,
              supplier: this.selectedSupplier,
            };
          }
          if (this.selectedEnabled !== null) {
            params.filters = {
              ...params.filters,
              enabled: this.selectedEnabled,
            };
          }
          return this.productService.postSearchProduct(params);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dataSource$.next(response.results);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener los datos:', err);
          this.isLoading = false;
        },
      });
    this.doSearchSubject$.next();
  }
  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }
  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
