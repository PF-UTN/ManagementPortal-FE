import {
  LoadingComponent,
  TitleComponent,
  InputComponent,
  ListColumn,
  ListComponent,
  ButtonComponent,
  ModalComponent,
} from '@Common-UI';
import { ProductListItem, ProductParams, ProductService } from '@Product';
import { SupplierResponse, SupplierService } from '@Supplier';

import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatIconButton, MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, of, startWith, map } from 'rxjs';

interface PurchaseOrderItemForm {
  productId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  unitPrice: FormControl<number | null>;
}
interface PurchaseHeaderForm {
  supplierId: FormControl<number | null>;
  supplier: FormControl<SupplierResponse | null>;
  estimatedDeliveryDate: FormControl<string | null>; // formato ISO YYYY-MM-DD
  observation: FormControl<string | null>;
}

interface PurchaseOrderForm {
  header: FormGroup<PurchaseHeaderForm>;
  items: FormArray<FormGroup<PurchaseOrderItemForm>>;
  searchText: FormControl<string | null>;
}

@Component({
  selector: 'mp-purchase-order-created',
  standalone: true,
  imports: [
    LoadingComponent,
    TitleComponent,
    InputComponent,
    ListComponent,
    ButtonComponent,
    CommonModule,
    MatIconModule,
    MatIconButton,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './purchase-order-created.component.html',
  styleUrls: ['./purchase-order-created.component.scss'],
})
export class PurchaseOrderCreatedComponent {
  isLoading = signal(false);
  isLoadingProducts = signal(false);
  searchText = '';

  suppliers: SupplierResponse[] = [];
  filteredSuppliers$: Observable<SupplierResponse[]> = of([]);
  products: ProductListItem[] = [];
  filteredProducts: ProductListItem[] = [];
  selectedProducts: ProductListItem[] = [];

  form!: FormGroup<PurchaseOrderForm>;

  displayedColumns: string[] = [
    'name',
    'quantity',
    'unitPrice',
    'subtotal',
    'actions',
  ];

  productColumns: ListColumn<ProductListItem>[] = [
    {
      key: 'name', // Identificador único para la columna
      header: 'Nombre Producto',
      value: (item: ProductListItem) => item.name,
      bootstrapCol: 'col-8',
    },
    {
      key: 'actions',
      header: '',
      actions: [
        {
          description: 'Agregar producto',
          icon: 'add',
          action: (item: ProductListItem) => this.onAddProduct(item),
        },
      ],
      bootstrapCol: 'col-4',
    },
  ];

  listColumns: ListColumn<FormGroup<PurchaseOrderItemForm>>[] = [
    {
      key: 'name',
      header: 'Producto',
      value: (item) => this.getProductName(item.controls.productId.value),
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      value: (item) => (item.controls.quantity.value || 0).toString(), // Convertir a string
    },
    {
      key: 'unitPrice',
      header: 'Precio',
      value: (item) =>
        new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(item.controls.unitPrice.value || 0),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      value: (item) =>
        new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(
          (item.controls.quantity.value || 0) *
            (item.controls.unitPrice.value || 0),
        ),
    },
  ];

  constructor(
    private router: Router,
    private supplierService: SupplierService,
    private productService: ProductService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup<PurchaseOrderForm>({
      header: new FormGroup<PurchaseHeaderForm>({
        supplier: new FormControl<SupplierResponse | null>(null, [
          Validators.required,
          this.supplierObjectValidator(),
        ]),
        supplierId: new FormControl<number | null>(null),
        estimatedDeliveryDate: new FormControl<string | null>(null),
        observation: new FormControl<string | null>(null),
      }),
      items: new FormArray<FormGroup<PurchaseOrderItemForm>>([]), // Especificar el tipo correcto
      searchText: new FormControl<string | null>(null),
    });

    this.initSuppliers();
  }

  private initSuppliers(): void {
    this.supplierService.getSuppliers().subscribe((suppliers) => {
      this.suppliers = suppliers;
      this.filteredSuppliers$ =
        this.form.controls.header.controls.supplier.valueChanges.pipe(
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

  onSupplierSelected(event: MatAutocompleteSelectedEvent): void {
    const supplier = event.option.value as SupplierResponse;
    this.form.controls.header.patchValue({
      supplierId: supplier.id,
      supplier: supplier,
    });

    // Llamar al método para cargar los productos del proveedor seleccionado
    this.loadProductsBySupplier(supplier.businessName);
  }

  private filterSuppliers(name: string): SupplierResponse[] {
    const filterValue = name.toLowerCase();
    return this.suppliers.filter((supplier) =>
      supplier.businessName.toLowerCase().includes(filterValue),
    );
  }

  get items(): FormArray<FormGroup<PurchaseOrderItemForm>> {
    return this.form.controls.items as FormArray<
      FormGroup<PurchaseOrderItemForm>
    >;
  }

  supplierObjectValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }
      const exists = this.suppliers.some(
        (supplier) => supplier.id === value.id,
      );
      return exists ? null : { invalidSupplier: true };
    };
  }

  displaySupplierName(supplier: SupplierResponse | null): string {
    return supplier?.businessName || '';
  }

  private loadProductsBySupplier(supplierBusinessName: string): void {
    this.isLoadingProducts.set(true);
    const searchText = this.form.controls.searchText.value || ''; // Usar cadena vacía si es null
    const params: ProductParams = {
      page: 1,
      pageSize: 100, // Traer todos los productos del proveedor
      filters: { supplierBusinessName: [supplierBusinessName] },
      searchText, // Asegurar que searchText sea válido
    };

    this.productService.postSearchProduct(params).subscribe({
      next: (response) => {
        this.products = response.results;
        this.filteredProducts = [...this.products];
        this.isLoadingProducts.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos del proveedor:', err);
        this.isLoadingProducts.set(false);
      },
    });
  }

  getProductName(productId: number | null): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : 'Producto desconocido';
  }

  onSearchProducts(): void {
    const searchTextLower =
      this.form.controls.searchText.value?.toLowerCase() || ''; // Manejar null
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(searchTextLower),
    );
  }

  onAddProduct(product: ProductListItem): void {
    const existingItem = this.items.controls.find(
      (item) => item.controls.productId.value === product.id,
    );

    if (!existingItem) {
      const newItem: FormGroup<{
        productId: FormControl<number | null>;
        quantity: FormControl<number | null>;
        unitPrice: FormControl<number | null>;
      }> = new FormGroup({
        productId: new FormControl<number | null>(
          product.id,
          Validators.required,
        ),
        quantity: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(1),
        ]), // Cantidad inicial vacía
        unitPrice: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(1),
        ]), // Precio inicial vacío
      });

      this.items.push(newItem);
    }
  }

  updateQuantity(productId: number, value: number): void {
    const item = this.items.controls.find(
      (item) => item.controls.productId.value === productId,
    );

    if (item) {
      item.controls.quantity.setValue(value);
    }
  }

  updatePrice(productId: number, value: number): void {
    const item = this.items.controls.find(
      (item) => item.controls.productId.value === productId,
    );

    if (item) {
      item.controls.unitPrice.setValue(value);
    }
  }

  removeProduct(productId: number): void {
    const index = this.items.controls.findIndex(
      (item) => item.controls.productId.value === productId,
    );

    if (index !== -1) {
      this.items.removeAt(index);
    }
  }

  onClearOrder(): void {
    // Verifica si hay productos seleccionados
    if (this.items.length > 0) {
      // Abre el modal de confirmación
      const dialogRef = this.dialog.open(ModalComponent, {
        data: {
          title: 'Confirmación',
          message:
            '¿Está seguro de que desea limpiar la orden de compra en curso? Esto eliminará todos los datos ingresados.',
          confirmText: 'Aceptar',
          cancelText: 'Cancelar',
        },
      });

      // Maneja la respuesta del modal
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Si el usuario confirma, reinicia los formularios
          this.resetForms();
        }
      });
    } else {
      // Si no hay productos seleccionados, simplemente reinicia los formularios
      this.resetForms();
    }
  }

  resetForms(): void {
    // Reinicia todos los formularios como si se entrara a la página de cero
    this.form.reset();
    this.items.clear();
  }

  calculateTotal(): number {
    return this.items.controls.reduce((total, item) => {
      const quantity = item.controls.quantity.value || 0;
      const unitPrice = item.controls.unitPrice.value || 0;
      return total + quantity * unitPrice;
    }, 0);
  }

  onSubmit(): void {
    const purchaseOrder = {
      supplierId: this.form.controls.header.controls.supplierId.value,
      estimatedDeliveryDate:
        this.form.controls.header.controls.estimatedDeliveryDate.value,
      observation: this.form.controls.header.controls.observation.value,
      purchaseOrderItems: this.items.controls.map((item) => ({
        productId: item.controls.productId.value,
        quantity: item.controls.quantity.value,
        unitPrice: item.controls.unitPrice.value,
      })),
    };

    console.log(purchaseOrder);
    // Aquí podrías enviar el objeto al backend
  }

  goBack() {
    this.router.navigate(['/ordenes-compra']);
  }
}
