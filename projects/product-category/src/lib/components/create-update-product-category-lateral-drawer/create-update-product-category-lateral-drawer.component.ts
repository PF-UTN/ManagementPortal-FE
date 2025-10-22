import {
  InputComponent,
  LateralDrawerContainer,
  LateralDrawerService,
  LoadingComponent,
} from '@Common-UI';

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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, of, startWith } from 'rxjs';

import { ProductCategoryService } from '../../services/product-category.service';
import { ProductCategoryRequest } from './../../models/product-category-request.model';
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
    MatButtonModule,
    MatAutocompleteModule,
    LoadingComponent,
    InputComponent,
  ],
  templateUrl: './create-update-product-category-lateral-drawer.component.html',
  styleUrl: './create-update-product-category-lateral-drawer.component.scss',
})
export class CreateUpdateProductCategoryLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  isLoadingCategories = signal(false);
  isLoading = signal(false);
  isUpdating = signal(false);
  isCreating = signal(false);
  isFormValid = signal(false);

  idCategory: number | null = null;

  public readonly NEW_CATEGORY_OPTION: ProductCategoryResponse = {
    id: -1,
    name: 'Crear nueva categoría',
    description: '',
  };

  productCategoryForm: FormGroup<{
    name: FormControl<string | ProductCategoryResponse | null>;
    description: FormControl<string | null>;
  }>;

  categories: ProductCategoryResponse[];
  filteredCategories$: Observable<ProductCategoryResponse[]> = of([]);

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly fb: FormBuilder,
    private readonly productCategoryService: ProductCategoryService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const isUpdate = this.isUpdating();
      const isCreate = this.isCreating();
      const isFormValid = this.isFormValid();

      let drawerTitle = 'Gestionar Categoría';
      if (isUpdate) {
        drawerTitle = 'Editar Categoría';
      } else if (isCreate) {
        drawerTitle = 'Nueva Categoría';
      }

      const drawerConfig = {
        ...this.lateralDrawerService.config,
        title: drawerTitle,
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: isUpdate ? 'Editar' : isCreate ? 'Crear' : 'Confirmar',
            loading: this.isLoading(),
            disabled: !isFormValid,
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
    this.setupFormWatchers();
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
    this.isLoadingCategories.set(true);
    this.productCategoryService.getCategoriesAsync().subscribe((categories) => {
      this.categories = categories;
      this.productCategoryForm.controls.name.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
        this.categoryObjectValidator(this.categories),
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
      this.isLoadingCategories.set(false);
    });
  }

  onCategorySelected(event: MatAutocompleteSelectedEvent) {
    const selected = event.option.value;

    if (selected === this.NEW_CATEGORY_OPTION) {
      this.isCreating.set(true);
      this.isUpdating.set(false);
      this.productCategoryForm.patchValue({
        name: null,
        description: null,
      });

      this.productCategoryForm.controls.name.enable();
      this.productCategoryForm.controls.description.enable();
      this.productCategoryForm.controls.name.markAsUntouched();
    } else {
      const category = selected as ProductCategoryResponse;
      this.isCreating.set(false);
      this.isUpdating.set(true);
      this.idCategory = category.id;
      this.productCategoryForm.patchValue({
        name: category,
        description: category.description,
      });

      this.productCategoryForm.controls.name.disable();
      this.productCategoryForm.controls.description.enable();
    }
  }

  private setupFormWatchers() {
    this.productCategoryForm.valueChanges.subscribe(() => {
      this.isFormValid.set(this.productCategoryForm.valid);
    });
  }

  private filterCategories(name: string): ProductCategoryResponse[] {
    const filterValue = name.toLowerCase();

    const filtered = this.categories.filter((category) =>
      category.name.toLowerCase().includes(filterValue),
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

      if (this.isCreating()) {
        return null;
      }

      if (typeof value === 'string') {
        const exists = categories.some(
          (category) => category.name.toLowerCase() === value.toLowerCase(),
        );
        return exists ? null : { invalidCategory: true };
      }

      const exists = categories.some((category) => category.id === value?.id);
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

    const productCategory: ProductCategoryRequest = {
      id: this.idCategory ?? null,
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
            this.isCreating()
              ? 'Categoría de producto creada correctamente'
              : this.isUpdating()
                ? 'Categoría de producto modificada correctamente'
                : 'Categoría de producto gestionada correctamente',
            'Cerrar',
            {
              duration: 3000,
            },
          );
          this.emitSuccess();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Error al guardar categoría de producto', err);
          this.isLoading.set(false);
        },
      });
  }
}
