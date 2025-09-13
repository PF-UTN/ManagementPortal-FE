import { CartService, Cart, CartUpdateProductQuantity } from '@Cart';
import {
  TitleComponent,
  SubtitleComponent,
  LateralDrawerService,
  LoadingComponent,
  InputComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
    InputComponent,
    ProductCardComponent,
    ReactiveFormsModule,
    MatTooltipModule,
    InfiniteScrollDirective,
  ],
  templateUrl: './product-list-client.component.html',
  styleUrls: ['./product-list-client.component.scss'],
})
export class ProductListClientComponent {
  products: ProductListItem[] = [];
  categories: ProductCategoryResponse[] = [];
  selectedCategories: string[] = [];
  sort: string = '';
  searchText: string = '';
  selectedProductId?: number;
  isLoading: boolean = true;
  hasMoreProducts: boolean = true;
  currentPage: number = 1;
  pageSize: number = 5;
  private filters$ = new Subject<void>();

  filterForm: FormGroup<{
    searchText: FormControl<string>;
    selectedCategories: FormControl<string[]>;
    sort: FormControl<string>;
  }>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly cartService: CartService,
  ) {
    this.filterForm = this.fb.group({
      searchText: this.fb.control('', { nonNullable: true }),
      selectedCategories: this.fb.control<string[]>([], { nonNullable: true }),
      sort: this.fb.control('', { nonNullable: true }),
    });
  }

  ngOnInit() {
    this.isLoading = true;

    this.productService.getCategories().subscribe({
      next: (categories) => (this.categories = categories),
    });

    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage = 1;
      this.products = [];
      this.hasMoreProducts = true;
      this.doSearch();
    });

    this.doSearch();
  }

  private doSearch(): void {
    this.isLoading = true;
    const { searchText, selectedCategories, sort } = this.filterForm.value;
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
      page: this.currentPage,
      pageSize: this.pageSize,
      searchText,
      filters,
      ...(orderBy && { orderBy }),
    };

    this.productService.postSearchProduct(params).subscribe({
      next: (res: SearchProductResponse) => {
        this.products = [...this.products, ...res.results];

        this.isLoading = false;
        this.hasMoreProducts = res.results.length === this.pageSize;
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
        this.hasMoreProducts = false;
      },
    });
  }

  onScroll(): void {
    if (!this.isLoading && this.hasMoreProducts) {
      this.currentPage++;
      this.doSearch();
    }
  }

  onAddToCartKeyDown() {
    console.log('Add to cart key down event triggered');
  }

  clearSearch() {
    this.filterForm.controls.searchText?.setValue('');
  }

  onCardKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.selectedProductId !== undefined) {
      this.openProductDrawer({
        productId: this.selectedProductId,
        quantity: 1,
      });
    }
  }

  openProductDrawer(event: { productId: number; quantity: number }) {
    const product = this.products.find((p) => p.id === event.productId);
    const quantityAvailable = (product?.stock ?? 0) > 0;

    this.lateralDrawerService.open(
      DetailLateralClientDrawerComponent,
      {
        productId: event.productId,
        quantity: event.quantity,
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
            click: () => this.lateralDrawerService.close(),
          },
        },
      },
    );
  }

  handleAddToCart(event: { productId: number; quantity: number }) {
    this.cartService.getCart().subscribe((cart: Cart) => {
      const existingItem = cart.items.find(
        (item) => item.product.id === event.productId,
      );

      const newQuantity = existingItem
        ? existingItem.quantity + event.quantity
        : event.quantity;

      const params: CartUpdateProductQuantity = {
        productId: event.productId,
        quantity: newQuantity,
      };

      this.cartService.addProductToCart(params).subscribe();
    });
  }
}
