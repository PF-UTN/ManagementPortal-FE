import { fetchFileFromUrl$ } from '@Common';
import {
  TitleComponent,
  ButtonComponent,
  SubtitleComponent,
  LoadingComponent,
  LateralDrawerService,
  InputComponent,
  FileUploaderComponent,
} from '@Common-UI';
import {
  CreateUpdateProductCategoryLateralDrawerComponent,
  ProductCategoryResponse,
} from '@Product-Category';
import {
  SupplierResponse,
  CreateUpdateSupplierLateralDrawerComponent,
  SupplierService,
} from '@Supplier';

import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
  FormControl,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, startWith, map, mergeMap, forkJoin, tap } from 'rxjs';

import { ProductDetail } from '../../models/product-detail.model';
import {
  ProductStockChange,
  StockChangeField,
} from '../../models/product-stock-change.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'mp-product-create',
  standalone: true,
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ButtonComponent,
    MatIconModule,
    SubtitleComponent,
    MatAutocompleteModule,
    TitleComponent,
    MatSlideToggleModule,
    MatIconButton,
    MatButtonModule,
    LoadingComponent,
    InputComponent,
    FileUploaderComponent,
  ],
})
export class ProductCreateComponent {
  productForm!: FormGroup<{
    name: FormControl<string | null>;
    description: FormControl<string | null>;
    price: FormControl<number | null>;
    enabled: FormControl<boolean | null>;
    weight: FormControl<number | null>;
    category: FormControl<ProductCategoryResponse | null>;
    categoryId: FormControl<number | null>;
    supplier: FormControl<SupplierResponse | null>;
    supplierId: FormControl<number | null>;
    stock: FormGroup<{
      quantityOrdered: FormControl<number | null>;
      quantityAvailable: FormControl<number | null>;
      quantityReserved: FormControl<number | null>;
    }>;
    stockChangeReason?: FormControl<string | null>;
    file: FormControl<File | null>;
  }>;

  isSubmitting = signal(false);
  categories: ProductCategoryResponse[] = [];
  filteredCategories$: Observable<ProductCategoryResponse[]> = of([]);
  suppliers: SupplierResponse[] = [];
  filteredSuppliers$: Observable<SupplierResponse[]> = of([]);

  isLoading = signal(true);
  stockOnlyMode = false;

  public readonly MANAGE_CATEGORY_OPTION: ProductCategoryResponse = {
    id: -1,
    name: 'Gestionar categorías',
    description: '',
  };

  public readonly MANAGE_SUPPLIER_OPTION: SupplierResponse = {
    id: -1,
    businessName: 'Gestionar proveedor',
    documentType: '',
    documentNumber: '',
    email: '',
    phone: '',
    addressId: -1,
  };
  selectedFiles = signal<File[]>([]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit() {
    this.stockOnlyMode = this.checkStockOnlyMode();
    this.initForm();
    this.disableFormForStockOnlyMode();

    this.initSelectors().subscribe(() => {
      this.loadProductIfEditing();
    });
  }

  private initSelectors() {
    return forkJoin({
      categories: this.productService.getCategories(),
      suppliers: this.supplierService.getSuppliers(),
    }).pipe(
      tap(({ categories, suppliers }) => {
        this.initCategories(categories);
        this.initSuppliers(suppliers);
      }),
    );
  }

  private checkStockOnlyMode(): boolean {
    return this.route.snapshot.queryParamMap.get('stockOnly') === 'true';
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: new FormControl<string | null>(null, Validators.required),
      description: new FormControl<string | null>(null, Validators.required),
      price: new FormControl<number | null>(null, Validators.required),
      enabled: new FormControl<boolean | null>(true),
      weight: new FormControl<number | null>(null, Validators.required),
      category: new FormControl<ProductCategoryResponse | null>(
        null,
        Validators.required,
      ),
      categoryId: new FormControl<number | null>(null, Validators.required),
      supplier: new FormControl<SupplierResponse | null>(
        null,
        Validators.required,
      ),
      supplierId: new FormControl<number | null>(null, Validators.required),
      stock: this.fb.group({
        quantityOrdered: new FormControl<number | null>(0, Validators.required),
        quantityAvailable: new FormControl<number | null>(
          0,
          Validators.required,
        ),
        quantityReserved: new FormControl<number | null>(
          0,
          Validators.required,
        ),
      }),
      ...(this.stockOnlyMode && {
        stockChangeReason: new FormControl<string | null>(
          null,
          Validators.required,
        ),
      }),
      file: new FormControl<File | null>(null, Validators.required),
    });
  }

  private disableFormForStockOnlyMode(): void {
    if (!this.stockOnlyMode) return;

    Object.entries(this.productForm.controls).forEach(([key, control]) => {
      if (key !== 'stock' && key !== 'stockChangeReason') {
        control.disable();
      }
    });
  }

  private loadProductIfEditing(): void {
    this.route.paramMap
      .pipe(
        mergeMap((params) => {
          const productId = params.get('id');

          return this.productService.getProductById(+productId!).pipe(
            mergeMap((product) => {
              if (product.imageUrl) {
                return fetchFileFromUrl$(product.imageUrl).pipe(
                  mergeMap((imageFile) => of({ product, imageFile })),
                );
              } else {
                return of({ product, imageFile: null });
              }
            }),
          );
        }),
      )
      .subscribe(({ product, imageFile }) => {
        if (!product) {
          this.isLoading.set(false);
          return;
        }

        this.patchFormWithProduct(product);

        if (imageFile) {
          this.selectedFiles.set([imageFile]);
        }

        if (!this.stockOnlyMode) {
          this.productForm.controls.stock.disable();
        }

        this.isLoading.set(false);
      });
  }

  private patchFormWithProduct(product: ProductDetail): void {
    const category = this.categories.find(
      (category) => category.name === product.category?.name,
    );
    const supplier = this.suppliers.find(
      (sup) => sup.businessName === product.supplier?.businessName,
    );

    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      enabled: product.enabled,
      weight: product.weight,
      category,
      categoryId: category?.id,
      supplier,
      supplierId: supplier?.id,
      stock: {
        quantityOrdered: product.stock?.quantityOrdered,
        quantityAvailable: product.stock?.quantityAvailable,
        quantityReserved: product.stock?.quantityReserved,
      },
    });
  }

  private initCategories(categories: ProductCategoryResponse[]): void {
    this.categories = categories;
    this.productForm.controls.category.setValidators([
      Validators.required,
      this.categoryObjectValidator(this.categories),
    ]);
    this.productForm.controls.category.updateValueAndValidity();

    this.filteredCategories$ =
      this.productForm.controls.category.valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value?.name)),
        map((name) =>
          name ? this.filterCategories(name) : this.categories.slice(),
        ),
      );
  }

  private initSuppliers(suppliers: SupplierResponse[]): void {
    this.suppliers = suppliers;
    this.productForm.controls.supplier.setValidators([
      Validators.required,
      this.supplierObjectValidator(this.suppliers),
    ]);
    this.productForm.controls.supplier.updateValueAndValidity();

    this.filteredSuppliers$ =
      this.productForm.controls.supplier.valueChanges.pipe(
        startWith(''),
        map((value) =>
          typeof value === 'string' ? value : value?.businessName,
        ),
        map((name) =>
          name ? this.filterSuppliers(name) : this.suppliers.slice(),
        ),
      );
  }

  onFilesSelected(files: File[]) {
    if (files.length === 0) {
      this.productForm.patchValue({ file: null });
      return;
    }

    this.productForm.patchValue({ file: files[0] });
  }

  get showBackArrow(): boolean {
    return !this.router.url.endsWith('/productos');
  }

  onCategorySelected(event: MatAutocompleteSelectedEvent) {
    const category = event.option.value as ProductCategoryResponse;
    if (category === this.MANAGE_CATEGORY_OPTION) {
      this.onCreateUpdateProductCategoryDrawer();
      this.productForm.controls.category.reset();
    } else {
      this.productForm.patchValue({ categoryId: category?.id });
    }
  }

  onSupplierSelected(event: MatAutocompleteSelectedEvent) {
    const supplier = event.option.value as SupplierResponse;
    if (supplier === this.MANAGE_SUPPLIER_OPTION) {
      this.onCreateUpdateSupplierDrawer();
      this.productForm.controls.supplier.reset();
    } else {
      this.productForm.patchValue({ supplierId: supplier?.id });
    }
  }

  categoryObjectValidator(categories: ProductCategoryResponse[]): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }
      const exists = categories.some((category) => category.id === value.id);
      return exists ? null : { invalidCategory: true };
    };
  }

  supplierObjectValidator(suppliers: SupplierResponse[]): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }
      const exists = suppliers.some((sup) => sup.id === value.id);
      return exists ? null : { invalidSupplier: true };
    };
  }

  private filterCategories(name: string): ProductCategoryResponse[] {
    const filterValue = name.toLowerCase();
    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(filterValue),
    );
  }

  private filterSuppliers(name: string): SupplierResponse[] {
    const filterValue = name.toLowerCase();
    return this.suppliers.filter((sup) =>
      sup.businessName.toLowerCase().includes(filterValue),
    );
  }
  onCreateUpdateSupplierDrawer(): void {
    this.lateralDrawerService
      .open(
        CreateUpdateSupplierLateralDrawerComponent,
        {},
        {
          title: 'Gestionar Proveedor',
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
      .subscribe(() => this.initSelectors().subscribe());
  }
  onCreateUpdateProductCategoryDrawer(): void {
    this.lateralDrawerService
      .open(
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
      )
      .subscribe(() => this.initSelectors().subscribe());
  }
  displayCategory(category: ProductCategoryResponse): string {
    return category?.name ?? '';
  }

  displaySupplier(supplier: SupplierResponse): string {
    return supplier?.businessName ?? '';
  }

  goBack() {
    this.router.navigate(['/productos']);
  }

  get stockReasonHint(): string {
    const value = this.productForm.controls.stockChangeReason!.value || '';
    return `${value.length}/50`;
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSubmitting.set(true);

      const formValue = this.productForm.value;

      const formData = new FormData();
      formData.append('name', formValue.name!);
      formData.append('description', formValue.description!);
      formData.append('price', String(formValue.price!));
      formData.append('enabled', String(formValue.enabled ?? true));
      formData.append('weight', String(formValue.weight!));
      formData.append('categoryId', String(formValue.categoryId!));
      formData.append('supplierId', String(formValue.supplierId!));
      formData.append('stock', JSON.stringify(formValue.stock!));
      formData.append('image', formValue.file!);

      const productId = this.route.snapshot.paramMap.get('id');

      if (this.stockOnlyMode && productId) {
        const previous = this.productService.getProductById(+productId);
        previous.subscribe((product) => {
          const changes: ProductStockChange[] = [];
          const stockControls = this.productForm.controls.stock.controls;
          if (
            product.stock?.quantityAvailable !==
            stockControls.quantityAvailable.value
          ) {
            changes.push({
              changedField: StockChangeField.Available,
              previousValue: product.stock?.quantityAvailable ?? 0,
              newValue: stockControls.quantityAvailable.value ?? 0,
            });
          }
          if (
            product.stock?.quantityReserved !==
            stockControls.quantityReserved.value
          ) {
            changes.push({
              changedField: StockChangeField.Reserved,
              previousValue: product.stock?.quantityReserved ?? 0,
              newValue: stockControls.quantityReserved.value ?? 0,
            });
          }
          if (
            product.stock?.quantityOrdered !==
            stockControls.quantityOrdered.value
          ) {
            changes.push({
              changedField: StockChangeField.Ordered,
              previousValue: product.stock?.quantityOrdered ?? 0,
              newValue: stockControls.quantityOrdered.value ?? 0,
            });
          }

          if (changes.length === 0) {
            this.snackBar.open('No hay cambios en el stock', 'Cerrar', {
              duration: 3000,
            });
            this.isSubmitting.set(false);
            return;
          }

          this.productService
            .changeProductStock({
              productId: +productId,
              changes,
              reason: this.productForm.controls.stockChangeReason?.value ?? '',
            })
            .subscribe({
              next: () => {
                this.snackBar.open('Stock ajustado correctamente', 'Cerrar', {
                  duration: 3000,
                });
                this.isSubmitting.set(false);
                this.router.navigate(['/productos']);
              },
              error: (err) => {
                console.error('Error al ajustar stock:', err);
                this.isSubmitting.set(false);
              },
            });
        });
        return;
      }

      if (productId) {
        this.productService.updateProduct(+productId, formData).subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.isSubmitting.set(false);
            this.router.navigate(['/productos']);
          },
          error: (err) => {
            console.error('Error al actualizar producto:', err);
            this.isSubmitting.set(false);
          },
        });
      } else {
        this.productService.createProduct(formData).subscribe({
          next: () => {
            this.snackBar.open('Producto creado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.isSubmitting.set(false);
            this.router.navigate(['/productos']);
          },
          error: (err) => {
            console.error('Error al crear producto:', err);
            this.isSubmitting.set(false);
          },
        });
      }
    }
  }
}
