import {
  TitleComponent,
  SubtitleComponent,
  LateralDrawerService,
  LoadingComponent,
  InputComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { switchMap, debounceTime, startWith } from 'rxjs/operators';

import { ProductCategoryResponse } from '../../models/product-category-response.model';
import { ProductListItem } from '../../models/product-item.model';
import {
  ProductParams,
  ProductOrderField,
  ProductOrderDirection,
} from '../../models/product-param.model';
import { SearchProductResponse } from '../../models/search-product-response.model';
import { ProductService } from '../../services/product.service';
import { DetailLateralClientDrawerComponent } from '../detail-lateral-client-drawer/detail-lateral-client-drawer.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'lib-product-list-client',
  standalone: true,
  imports: [
    TitleComponent,
    SubtitleComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    LoadingComponent,
    ProductCardComponent,
    InputComponent,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './product-list-client.component.html',
  styleUrls: ['./product-list-client.component.scss'],
})
export class ProductListClientComponent {
  products: ProductListItem[] = [];
  categories: ProductCategoryResponse[] = [];
  selectedCategories: string[] = [];
  quantities: { [productId: number]: number } = {};
  stockError: { [productId: number]: boolean } = {};

  sort: string = '';
  searchText: string = '';
  selectedProductId?: number;
  isLoading: boolean = true;
  filterForm: FormGroup;
  private filters$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {
    this.filterForm = this.fb.group({
      searchText: [''],
      selectedCategories: [[]],
      sort: [''],
    });
  }

  ngOnInit() {
    this.isLoading = true;

    this.productService.getCategories().subscribe({
      next: (categories) => (this.categories = categories),
    });

    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.filters$.next();
    });

    this.filters$.next();
    this.filters$
      .pipe(
        startWith(null),
        switchMap(() => {
          this.isLoading = true;
          const { searchText, selectedCategories, sort } =
            this.filterForm.value;
          const selectedCategoryNames =
            selectedCategories && selectedCategories.length > 0
              ? this.categories
                  .filter((category) =>
                    selectedCategories.includes(String(category.id)),
                  )
                  .map((category) => category.name)
              : undefined;

          const filters: Pick<ProductParams['filters'], 'categoryName'> = {
            categoryName: selectedCategoryNames,
          };

          let orderBy;
          if (sort && typeof sort === 'string' && sort.includes('-')) {
            const [field, direction] = sort.split('-');
            orderBy = {
              field: field as ProductOrderField,
              direction: direction as ProductOrderDirection,
            };
          }

          const params: ProductParams = {
            page: 1,
            pageSize: 999999,
            searchText,
            filters,
            ...(orderBy && { orderBy }),
          };

          return this.productService.postSearchProduct(params);
        }),
      )
      .subscribe({
        next: (res: SearchProductResponse) => {
          this.products = res.results;
          this.isLoading = false;
        },
        error: () => {
          this.products = [];
          this.isLoading = false;
        },
      });
  }

  onAddToCartKeyDown() {
    console.log('Add to cart key down event triggered');
  }

  clearSearch() {
    this.filterForm.controls['searchText']?.setValue('');
  }

  onCardKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.selectedProductId !== undefined) {
      this.openProductDrawer(this.selectedProductId);
    }
  }

  canOpenProductDrawer(item: ProductListItem): boolean {
    return item.stock > 0 && (this.quantities[item.id] || 1) < item.stock;
  }

  private updateStockError(productId: number): void {
    const product = this.products.find(
      (p) => p.id.toString() === productId.toString(),
    );
    this.stockError[productId] =
      !!product && this.quantities[productId] > product.stock;
  }

  increaseQuantity(productId: number) {
    if (!this.quantities[productId]) {
      this.quantities[productId] = 1;
    }
    this.quantities[productId]++;
    this.updateStockError(productId);
  }

  decreaseQuantity(productId: number) {
    if (!this.quantities[productId]) {
      this.quantities[productId] = 1;
    }
    if (this.quantities[productId] > 1) {
      this.quantities[productId]--;
    }
    this.updateStockError(productId);
  }

  onQuantityInput(productId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value) || value < 1) value = 1;

    const product = this.products.find(
      (p) => p.id.toString() === productId.toString(),
    );
    if (product && value > product.stock) {
      value = product.stock;
    }

    this.quantities[productId] = value;
    input.value = value.toString();

    this.updateStockError(productId);
  }

  openProductDrawer(productId: number) {
    const product = this.products.find((p) => p.id === productId);
    const quantityAvailable = product ? product.stock > 0 : false;

    this.lateralDrawerService.open(
      DetailLateralClientDrawerComponent,
      {
        productId,
        quantity: this.quantities[productId] || 1,
      },
      {
        title: 'Detalle del Producto',
        footer: {
          firstButton: {
            text: 'Agregar al carrito',
            disabled: !quantityAvailable,
            click: () => this.lateralDrawerService.close(),
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
}
