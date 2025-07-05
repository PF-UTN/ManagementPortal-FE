import {
  ColumnTypeEnum,
  DropdownButtonComponent,
  LateralDrawerService,
  TableColumn,
  TableComponent,
  DropdownItem,
} from '@Common-UI';
import { CreateUpdateSupplierLateralDrawerComponent } from '@Supplier';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { ProductListItem } from '../../models/product-item.model';
import { ProductParams } from '../../models/product-param.model';
import { ProductService } from '../../services/product.service';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';
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
    DropdownButtonComponent,
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
      columnDef: 'category',
      header: 'Categoría',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.categoryName,
    },
    {
      columnDef: 'price',
      header: 'Precio',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.price.toFixed(2),
    },
    {
      columnDef: 'stock',
      header: 'Stock Disponible',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.stock.toString(),
    },
    {
      columnDef: 'peso',
      header: 'Peso',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) => element.weight.toString(),
    },
    {
      columnDef: 'enabled',
      header: 'Estado',
      type: ColumnTypeEnum.VALUE,
      value: (element: ProductListItem) =>
        element.enabled ? 'Activo' : 'Pausado',
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: ProductListItem) => this.onDetailDrawer(element),
        },
        {
          description: 'Modificar',
          action: (element: ProductListItem) => this.onModifyDrawer(element),
        },
        {
          description: 'Pausar',
          action: (element: ProductListItem) => this.onPauseDrawer(element),
        },
        {
          description: 'Eliminar',
          action: (element: ProductListItem) => this.onDeleteDrawer(element),
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<ProductListItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;
  selectedCategories: string[] = [];
  selectedEnabled: boolean | null = null;
  selectedSuppliers: string[] = [];
  dropdownItems: DropdownItem[] = [
    {
      label: 'Crear nuevo producto',
      action: () => {
        this.router.navigate(['/productos/crear']);
      },
    },
    {
      label: 'Crear/Editar categoría',
      action: () => console.log('crear categoria'),
    }, //Accion Provisorio hasta que se implemente el drawer
    {
      label: 'Crear/Editar proveedor',
      action: () => this.onCreateUpdateSupplierDrawer(),
    },
    {
      label: 'Ver como cliente',
      action: () => {
        void this.router.navigate(['/productos/cliente']);
      },
    },
  ];

  doSearchSubject$ = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params: ProductParams = {
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            searchText: '',
            filters: {},
          };
          if (this.selectedEnabled !== null) {
            params.filters = { enabled: this.selectedEnabled };
          }
          if (this.selectedCategories.length > 0) {
            params.filters.categoryName = this.selectedCategories;
          }
          if (this.selectedSuppliers.length > 0) {
            params.filters.supplierBusinessName = this.selectedSuppliers;
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

  onDetailDrawer(request: ProductListItem): void {
    this.lateralDrawerService.open(
      DetailLateralDrawerComponent,
      { productId: request.id },
      {
        title: 'Detalle del Producto',
        footer: {
          firstButton: {
            text: 'Cerrar',
            click: () => this.lateralDrawerService.close(),
          },
        },
      },
    );
  }

  onCreateUpdateSupplierDrawer(): void {
    this.lateralDrawerService
      .open(
        CreateUpdateSupplierLateralDrawerComponent,
        {},
        {
          title: 'Crear / Editar Proveedor',
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
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  onModifyDrawer(request: ProductListItem): void {
    console.log('Modificar', request); //Provisorio hasta que se implemente el drawer
  }

  onDeleteDrawer(request: ProductListItem): void {
    console.log('Eliminar', request); //Provisorio hasta que se implemente el drawer
  }

  onPauseDrawer(request: ProductListItem): void {
    console.log('Pausar', request); //Provisorio hasta que se implemente el drawer
  }

  onEnabledFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onCategoryFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  onSupplierFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
