import {
  ColumnTypeEnum,
  DropdownButtonComponent,
  LateralDrawerService,
  TableColumn,
  TableComponent,
  DropdownItem,
  PillStatusEnum,
} from '@Common-UI';
import {
  CreateUpdateProductCategoryLateralDrawerComponent,
  ProductCategoryService,
  ProductCategoryResponse,
} from '@Product-Category';
import {
  CreateUpdateSupplierLateralDrawerComponent,
  SupplierCreateUpdateResponse,
  SupplierService,
} from '@Supplier';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { ProductListItem } from '../../models/product-item.model';
import { ProductParams } from '../../models/product-param.model';
import { ProductService } from '../../services/product.service';
import { DeletedProductLateralDrawerComponent } from '../deleted-product-lateral-drawer/deleted-product-lateral-drawer.component';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';
import { ToggleProductLatearalDrawerComponent } from '../toggle-product-latearal-drawer/toggle-product-latearal-drawer.component';

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
  providers: [CurrencyPipe],
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
      value: (item) =>
        this.currencyPipe.transform(
          item.price,
          'ARS',
          'symbol',
          '1.2-2',
          'es-AR',
        ) ?? '',
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
      value: (element: ProductListItem) =>
        new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(
          element.weight,
        ) + ' kg',
    },
    {
      columnDef: 'enabled',
      header: 'Estado',
      type: ColumnTypeEnum.PILL,
      value: (element: ProductListItem) =>
        element.enabled ? 'Activo' : 'Pausado',
      pillStatus: (element: ProductListItem) =>
        element.enabled ? PillStatusEnum.Done : PillStatusEnum.Cancelled,
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
          action: (element: ProductListItem) => this.onModifyProduct(element),
        },
        {
          description: 'Pausar/Reanudar',
          action: (element: ProductListItem) => this.onPauseDrawer(element),
        },
        {
          description: 'Eliminar',
          action: (element: ProductListItem) => this.onDeleteDrawer(element),
        },
        {
          description: 'Ajustar stock',
          action: (element: ProductListItem) =>
            this.onModifyProductStock(element),
        },
      ],
    },
  ];

  categories: ProductCategoryResponse[];
  suppliers: SupplierCreateUpdateResponse[];
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
      action: () => this.onCreateUpdateProductCategoryDrawer(),
    },
    {
      label: 'Crear/Editar proveedor',
      action: () => this.onCreateUpdateSupplierDrawer(),
    },
  ];

  doSearchSubject$ = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly supplierService: SupplierService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private currencyPipe: CurrencyPipe,
  ) {}

  ngOnInit(): void {
    this.initCategories();
    this.initSuppliers();
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

  private initCategories(): void {
    this.productCategoryService.getCategoriesAsync().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      },
    });
  }

  private initSuppliers(): void {
    this.supplierService.getSuppliersAsync().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
      },
      error: (err) => {
        console.error('Error al obtener los proveedores:', err);
      },
    });
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

  onCreateUpdateProductCategoryDrawer(): void {
    this.lateralDrawerService.open(
      CreateUpdateProductCategoryLateralDrawerComponent,
      {},
      {
        title: 'Gestionar Categoría',
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
    );
  }

  onModifyProduct(request: ProductListItem): void {
    this.router.navigate(['/productos/editar', request.id]);
  }

  onModifyProductStock(request: ProductListItem): void {
    this.router.navigate(['/productos/editar', request.id], {
      queryParams: { stockOnly: true },
    });
  }

  onDeleteDrawer(request: ProductListItem): void {
    this.lateralDrawerService
      .open(
        DeletedProductLateralDrawerComponent,
        { productId: request.id },
        {
          title: 'Eliminar producto',
          footer: {
            firstButton: {
              text: 'Eliminar',
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
      });
  }

  onPauseDrawer(request: ProductListItem): void {
    const isEnabled = request.enabled;
    this.lateralDrawerService
      .open(
        ToggleProductLatearalDrawerComponent,
        { productId: request.id, isPause: true },
        {
          title: 'Pausar producto',
          footer: {
            firstButton: {
              text: isEnabled ? 'Pausar' : 'Reanudar',
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
      });
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
