import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, of, startWith } from 'rxjs';

import { ProductCategory } from '../../models/product-category.model';
import { ProductCategoryService } from '../../services/product-category.service';
import { ProductCategoryResponse } from './../../models/product-category-response.model';

@Component({
  selector: 'mp-create-update-product-category-lateral-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatIconButton,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './create-update-product-category-lateral-drawer.component.html',
  styleUrl: './create-update-product-category-lateral-drawer.component.scss',
})
export class CreateUpdateProductCategoryLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  isLoading = signal(false);
  isCreating = signal(false);
  isUpdating = signal(false);
  isCategorySelected = signal(false);

  public readonly NEW_CATEGORY_OPTION: ProductCategoryResponse = {
    id: -1,
    name: 'Crear nueva categoría',
    description: '',
  };

  productCategoryForm: FormGroup<{
    name: FormControl<string | ProductCategoryResponse | null>;
    description: FormControl<string | null>;
  }>;

  categories: ProductCategoryResponse[] = [];
  filteredCategories$: Observable<ProductCategoryResponse[]> = of([]);

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly fb: FormBuilder,
    private readonly productCategoryService: ProductCategoryService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: 'Confirmar',
            loading: this.isLoading(),
          },
          secondButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
          },
        },
      };

      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.initCategories();
    this.productCategoryForm.controls.description.disable();
  }

  private initForm() {
    this.productCategoryForm = new FormGroup({
      name: new FormControl<string | ProductCategoryResponse | null>(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
      description: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
    });
  }

  private initCategories() {
    this.productCategoryService.getCategoriesAsync().subscribe((categories) => {
      this.categories = categories;
      this.productCategoryForm.controls.name.setValidators([
        Validators.required,
        //this.categoryObjectValidator(this.categories),
      ]);
      this.productCategoryForm.controls.name.updateValueAndValidity();

      this.filteredCategories$ =
        this.productCategoryForm.controls.name.valueChanges.pipe(
          startWith(''),
          map((value) => (typeof value === 'string' ? value : value?.name)),
          map((name) =>
            name ? this.filterCategories(name) : this.categories.slice(),
          ),
        );
    });
  }

  onCategorySelected(event: MatAutocompleteSelectedEvent) {
    this.isCategorySelected.set(true);
    const selected = event.option.value;

    if (selected === this.NEW_CATEGORY_OPTION) {
      // Crear nueva categoría: habilitar ambos
      this.isCreating.set(true);
      this.isUpdating.set(false);

      this.productCategoryForm.patchValue({
        name: '',
        description: '',
      });

      this.productCategoryForm.controls.name.enable();
      this.productCategoryForm.controls.description.enable();
      this.productCategoryForm.controls.name.reset();
    } else {
      const category = selected as ProductCategoryResponse;
      // Categoría existente: deshabilitar nombre, habilitar descripción
      this.isCreating.set(false);
      this.isUpdating.set(true);

      this.productCategoryForm.patchValue({
        name: category,
        description: category.description,
      });

      this.productCategoryForm.controls.name.disable();
      this.productCategoryForm.controls.description.enable();
    }
  }

  private filterCategories(name: string): ProductCategoryResponse[] {
    const filterValue = name.toLowerCase();

    const filtered = this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(filterValue),
    );

    return filtered;
  }

  displayCategory(category: ProductCategoryResponse | string): string {
    return typeof category === 'string' ? category : (category?.name ?? '');
  }

  categoryObjectValidator(categories: ProductCategoryResponse[]): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }

      if (typeof value === 'string') return null;

      const exists = categories.some((cat) => cat.id === value.id);
      return exists ? null : { invalidCategory: true };
    };
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
  }
  onSubmit() {
    if (this.productCategoryForm.invalid) {
      this.productCategoryForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);

    const nameControlValue = this.productCategoryForm.controls.name.value;

    const productCategory: ProductCategory = {
      name:
        typeof nameControlValue === 'string'
          ? nameControlValue
          : (nameControlValue?.name ?? ''),
      description: this.productCategoryForm.controls.description.value!,
    };

    this.productCategoryService
      .postCreateOrUpdateProductCategoryAsync(productCategory)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open(
            'Categoría de producto creada/modificada correctamente',
            'Cerrar',
            {
              duration: 3000,
            },
          );
          this.closeDrawer();
          this.emitSuccess();
        },
        error: (err) => {
          console.error('Error al guardar categoría de producto', err);
          this.isLoading.set(false);
        },
      });
  }
}
