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
  productForm: FormGroup;
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
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, Validators.required],
      enabled: [true],
      weight: [null, Validators.required],
      category: [null, Validators.required],
      categoryId: [null, Validators.required],
      supplier: [null, Validators.required],
      supplierId: [null, Validators.required],
      stock: this.fb.group({
        quantityOrdered: [0, Validators.required],
        quantityAvailable: [0, Validators.required],
        quantityReserved: [0, Validators.required],
      }),
    });
  }

  ngOnInit() {
    this.productService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.productForm
        .get('category')
        ?.setValidators([
          Validators.required,
          this.categoryObjectValidator(this.categories),
        ]);
      this.productForm.get('category')?.updateValueAndValidity();

      this.filteredCategories$ = this.productForm
        .get('category')!
        .valueChanges.pipe(
          startWith(''),
          map((value) => (typeof value === 'string' ? value : value?.name)),
          map((name) =>
            name ? this._filterCategories(name) : this.categories.slice(),
          ),
        );
    });

    this.supplierService.getSuppliers().subscribe((suppliers) => {
      this.suppliers = suppliers;
      this.productForm
        .get('supplier')
        ?.setValidators([
          Validators.required,
          this.supplierObjectValidator(this.suppliers),
        ]);
      this.productForm.get('supplier')?.updateValueAndValidity();

      this.filteredSuppliers$ = this.productForm
        .get('supplier')!
        .valueChanges.pipe(
          startWith(''),
          map((value) =>
            typeof value === 'string' ? value : value?.businessName,
          ),
          map((name) =>
            name ? this._filterSuppliers(name) : this.suppliers.slice(),
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
      if (!value) return { required: true };
      const exists = categories.some((cat) => cat.id === value.id);
      return exists ? null : { invalidCategory: true };
    };
  }

  supplierObjectValidator(suppliers: SupplierResponse[]): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return { required: true };
      const exists = suppliers.some((sup) => sup.id === value.id);
      return exists ? null : { invalidSupplier: true };
    };
  }

  private _filterCategories(name: string): ProductCategoryResponse[] {
    const filterValue = name.toLowerCase();
    return this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(filterValue),
    );
  }

  private _filterSuppliers(name: string): SupplierResponse[] {
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
      const category = this.productForm.value.category;
      const supplier = this.productForm.value.supplier;
      this.productForm.patchValue({
        categoryId: category?.id,
        supplierId: supplier?.id,
      });
      const formValue = { ...this.productForm.value };
      delete formValue.category;
      delete formValue.supplier;

      this.productService.createProduct(formValue).subscribe({
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
