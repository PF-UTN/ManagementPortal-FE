import {
  TitleComponent,
  SubtitleComponent,
  ButtonComponent,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ProductCategoryResponse } from '../../models/product-category-response.model';
import { ProductListItem } from '../../models/product-item.model';
import { ProductParams } from '../../models/product-param.model';
import { ProductService } from '../../services/product.service';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';

@Component({
  selector: 'lib-product-list-client',
  standalone: true,
  imports: [
    TitleComponent,
    SubtitleComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    CommonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconButton,
  ],
  templateUrl: './product-list-client.component.html',
  styleUrls: ['./product-list-client.component.scss'],
})
export class ProductListClientComponent {
  products: ProductListItem[] = [];
  categories: ProductCategoryResponse[] = [];
  selectedCategories: string[] = [];
  quantities: { [productId: string]: number } = {};
  stockError: { [productId: string]: boolean } = {};

  sort: string = '';
  searchText: string = '';
  selectedProductId?: number | string;
  isLoading: boolean = true;

  private searchTextChange$ = new Subject<string>();
  private filterChange$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.productService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
    });

    this.filterChange$.pipe(debounceTime(500)).subscribe(() => {
      this.fetchProducts();
    });

    this.searchTextChange$.pipe(debounceTime(500)).subscribe((text) => {
      this.searchText = text;
      this.fetchProducts();
    });

    this.fetchProducts();
  }

  onFilterChange() {
    this.filterChange$.next();
  }

  fetchProducts() {
    this.isLoading = true;

    const selectedCategoryNames =
      this.selectedCategories.length > 0
        ? this.categories
            .filter((cat) => this.selectedCategories.includes(String(cat.id)))
            .map((cat) => cat.name)
        : undefined;

    const filters: Pick<ProductParams['filters'], 'categoryName'> = {};
    if (selectedCategoryNames && selectedCategoryNames.length > 0) {
      filters.categoryName = selectedCategoryNames;
    }

    const params: ProductParams = {
      page: 1,
      pageSize: 999999,
      searchText: this.searchText,
      filters,
    };

    this.productService.postSearchProduct(params).subscribe({
      next: (res) => {
        let products = res.results || [];
        if (this.sort === 'price-asc') {
          products = products.sort((a, b) => a.price - b.price);
        } else if (this.sort === 'price-desc') {
          products = products.sort((a, b) => b.price - a.price);
        } else if (this.sort === 'name-asc') {
          products = products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sort === 'name-desc') {
          products = products.sort((a, b) => b.name.localeCompare(a.name));
        }
        this.products = products;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onSearchChange(value);
  }

  onSearchChange(value: string) {
    this.searchTextChange$.next(value);
  }

  increment(productId: string) {
    if (!this.quantities[productId]) this.quantities[productId] = 1;
    this.quantities[productId]++;
    const product = this.products.find((p) => p.id.toString() === productId);
    if (product && this.quantities[productId] > product.stock) {
      this.stockError[productId] = true;
    } else {
      this.stockError[productId] = false;
    }
  }

  decrement(productId: string) {
    if (!this.quantities[productId]) this.quantities[productId] = 1;
    if (this.quantities[productId] > 1) {
      this.quantities[productId]--;
      const product = this.products.find((p) => p.id.toString() === productId);
      if (product && this.quantities[productId] > product.stock) {
        this.stockError[productId] = true;
      } else {
        this.stockError[productId] = false;
      }
    }
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange('');
  }

  onQuantityInput(productId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value) || value < 1) value = 1;

    this.quantities[productId] = value;

    const product = this.products.find((p) => p.id.toString() === productId);
    if (product && this.quantities[productId] > product.stock) {
      this.stockError[productId] = true;
    } else {
      this.stockError[productId] = false;
    }
  }

  openProductDrawer(productId: number | string) {
    this.lateralDrawerService.open(
      DetailLateralDrawerComponent,
      { productId },
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
}
