import { TitleComponent, ButtonComponent, SubtitleComponent } from '@Common-UI';

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of, startWith, map } from 'rxjs';

import { ProductCategoryResponse } from '../../models/product-category-response.model';
import { ProductCreate } from '../../models/product-create-param.model';
import { SupplierResponse } from '../../models/supplier-response.model';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';

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
  }>;
  isSubmitting = signal(false);
  categories: ProductCategoryResponse[] = [];
  filteredCategories$: Observable<ProductCategoryResponse[]> = of([]);
  suppliers: SupplierResponse[] = [];
  filteredSuppliers$: Observable<SupplierResponse[]> = of([]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    {
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
          quantityOrdered: new FormControl<number | null>(
            0,
            Validators.required,
          ),
          quantityAvailable: new FormControl<number | null>(
            0,
            Validators.required,
          ),
          quantityReserved: new FormControl<number | null>(
            0,
            Validators.required,
          ),
        }),
      });
    }
    this.initCategories();
    this.initSuppliers();
  }

  private initCategories() {
    this.productService.getCategories().subscribe((categories) => {
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
    });
  }

  private initSuppliers() {
    this.supplierService.getSuppliers().subscribe((suppliers) => {
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
    });
  }

  get showBackArrow(): boolean {
    return !this.router.url.endsWith('/productos');
  }

  onCategorySelected(event: MatAutocompleteSelectedEvent) {
    const category = event.option.value as ProductCategoryResponse;
    this.productForm.patchValue({ categoryId: category?.id });
  }

  onSupplierSelected(event: MatAutocompleteSelectedEvent) {
    const supplier = event.option.value as SupplierResponse;
    this.productForm.patchValue({ supplierId: supplier?.id });
  }

  categoryObjectValidator(categories: ProductCategoryResponse[]): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }
      const exists = categories.some((cat) => cat.id === value.id);
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
    return this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(filterValue),
    );
  }

  private filterSuppliers(name: string): SupplierResponse[] {
    const filterValue = name.toLowerCase();
    return this.suppliers.filter((sup) =>
      sup.businessName.toLowerCase().includes(filterValue),
    );
  }

  displayCategory(category: ProductCategoryResponse): string {
    return category?.name ?? '';
  }

  displaySupplier(supplier: SupplierResponse): string {
    return supplier?.businessName ?? '';
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSubmitting.set(true);
      const product: ProductCreate = {
        name: this.productForm.controls.name.value!,
        description: this.productForm.controls.description.value!,
        price: this.productForm.controls.price.value!,
        enabled: this.productForm.controls.enabled.value ?? true,
        weight: this.productForm.controls.weight.value!,
        categoryId: this.productForm.controls.categoryId.value!,
        supplierId: this.productForm.controls.supplierId.value!,
        stock: {
          quantityOrdered:
            this.productForm.controls.stock.controls.quantityOrdered.value ?? 0,
          quantityAvailable:
            this.productForm.controls.stock.controls.quantityAvailable.value ??
            0,
          quantityReserved:
            this.productForm.controls.stock.controls.quantityReserved.value ??
            0,
        },
      };

      this.productService.createProduct(product).subscribe({
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
