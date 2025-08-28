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
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, startWith, map } from 'rxjs';

import { PurchaseOrderStatusOptionsId } from '../../constants/purchase-order-status-ids.enum';
import {
  PurchaseOrderDetail,
  PurchaseOrderItemDetail,
} from '../../models/purchase-order-detail.model';
import { PutUpdatePurchaseOrderRequest } from '../../models/put-update-purchase-order-request.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

interface PurchaseOrderItemForm {
  productId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  unitPrice: FormControl<number | null>;
}
interface PurchaseHeaderForm {
  supplierId: FormControl<number | null>;
  supplier: FormControl<SupplierResponse | null>;
  estimatedDeliveryDate: FormControl<string | null>;
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
    CommonModule,
    LoadingComponent,
    TitleComponent,
    InputComponent,
    ListComponent,
    ButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './purchase-order-created.component.html',
  styleUrls: ['./purchase-order-created.component.scss'],
})
export class PurchaseOrderCreatedComponent {
  isLoadingInitialData = signal(false);
  isLoading = signal(false);
  isLoadingProducts = signal(false);
  isModification = false;
  searchText = '';

  readonly STATUS_DRAFT = PurchaseOrderStatusOptionsId.Draft;
  readonly STATUS_ORDERED = PurchaseOrderStatusOptionsId.Ordered;
  readonly minDate = new Date();

  suppliers: SupplierResponse[] = [];
  filteredSuppliers$: Observable<SupplierResponse[]> = of([]);
  products: ProductListItem[] = [];
  filteredProducts: ProductListItem[] = [];
  selectedProducts: ProductListItem[] = [];
  initialPurchaseOrder: PurchaseOrderDetail;

  form!: FormGroup<PurchaseOrderForm>;

  existingPurchaseOrderId: number | null = null;

  displayedColumns: string[] = [
    'name',
    'quantity',
    'unitPrice',
    'subtotal',
    'actions',
  ];

  productColumns: ListColumn<ProductListItem>[] = [
    {
      key: 'name',
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
      bootstrapCol: 'col-6',
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      value: (item) => (item.controls.quantity.value || 0).toString(),
      bootstrapCol: 'col-2',
    },
    {
      key: 'unitPrice',
      header: 'Precio',
      value: (item) =>
        new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(item.controls.unitPrice.value || 0),
      bootstrapCol: 'col-2',
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
      bootstrapCol: 'col-2',
    },
  ];

  constructor(
    public router: Router,
    private supplierService: SupplierService,
    private productService: ProductService,
    private route: ActivatedRoute,
    public purchaseOrderService: PurchaseOrderService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.existingPurchaseOrderId = this.route.snapshot.params['id'];
    this.isModification = !!this.existingPurchaseOrderId;

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
      items: new FormArray<FormGroup<PurchaseOrderItemForm>>([]),
      searchText: new FormControl<string | null>(null),
    });

    this.initSuppliers();

    if (this.existingPurchaseOrderId) {
      this.loadInitialData();
    }
  }

  public loadInitialData(): void {
    this.isLoadingInitialData.set(true);
    this.purchaseOrderService
      .getPurchaseOrderById(this.existingPurchaseOrderId!)
      .subscribe({
        next: (purchaseOrder) => {
          this.initialPurchaseOrder = purchaseOrder;
          this.patchFormWithInitialData(purchaseOrder);
          this.loadProductsBySupplier(purchaseOrder.supplier.businessName);
          this.isLoadingInitialData.set(false);
        },
        error: () => {
          this.snackBar.open('Error al cargar la orden de compra', 'Cerrar', {
            duration: 3000,
          });
          this.isLoadingInitialData.set(false);
        },
      });
  }

  private patchFormWithInitialData(purchaseOrder: PurchaseOrderDetail): void {
    this.form.controls.header.patchValue({
      supplier: this.suppliers.find((s) => s.id === purchaseOrder.supplier.id),
      supplierId: purchaseOrder.supplier.id,
      estimatedDeliveryDate: purchaseOrder.estimatedDeliveryDate.toString(),
      observation: purchaseOrder.observation,
    });

    purchaseOrder.purchaseOrderItems.forEach(
      (item: PurchaseOrderItemDetail) => {
        const newItem: FormGroup<PurchaseOrderItemForm> = new FormGroup({
          productId: new FormControl<number | null>(item.productId, [
            Validators.required,
          ]),
          quantity: new FormControl<number | null>(item.quantity, [
            Validators.required,
            Validators.min(1),
          ]),
          unitPrice: new FormControl<number | null>(item.unitPrice, [
            Validators.required,
            Validators.min(1),
          ]),
        });

        this.items.push(newItem);
      },
    );
  }

  public initSuppliers(): void {
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

    this.loadProductsBySupplier(supplier.businessName);
  }

  public filterSuppliers(name: string): SupplierResponse[] {
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

  public loadProductsBySupplier(supplierBusinessName: string): void {
    this.isLoadingProducts.set(true);
    const searchText = this.form.controls.searchText.value || '';
    const params: ProductParams = {
      page: 1,
      pageSize: 100,
      filters: { supplierBusinessName: [supplierBusinessName] },
      searchText,
    };

    this.productService.postSearchProduct(params).subscribe({
      next: (response) => {
        this.products = response.results;
        this.filteredProducts = [...this.products];
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
      this.form.controls.searchText.value?.toLowerCase() || '';
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
        ]),
        unitPrice: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(1),
        ]),
      });

      this.items.push(newItem);
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
    if (this.items.length === 0) {
      this.resetForms();
      return;
    }

    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Confirmación',
        message:
          'Si cambia de proveedor se eliminará la orden de compra actual. ¿Desea continuar?',
        confirmText: 'Continuar',
        cancelText: 'Volver',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetForms();
      }
    });
  }

  resetForms(): void {
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

  onSubmit(statusId: number): void {
    this.isLoading.set(true);

    if (this.isModification) {
      const purchaseOrderUpdateRequest: PutUpdatePurchaseOrderRequest = {
        purchaseOrderStatusId: this.initialPurchaseOrder.status.id,
        estimatedDeliveryDate: new Date(
          this.form.controls.header.value.estimatedDeliveryDate!,
        ),
        observation: this.form.controls.header.value.observation!,
        purchaseOrderItems: this.items.controls.map((item) => ({
          productId: item.value.productId!,
          quantity: item.value.quantity!,
          unitPrice: item.value.unitPrice!,
        })),
      };

      this.purchaseOrderService
        .updatePurchaseOrderStatusAsync(
          this.existingPurchaseOrderId!,
          purchaseOrderUpdateRequest,
        )
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Orden de compra modificada con éxito',
              'Cerrar',
              {
                duration: 3000,
              },
            );
            this.router.navigate(['/ordenes-compra']);
          },
          error: () => {
            this.snackBar.open(
              'Error al modificar la orden de compra',
              'Cerrar',
              {
                duration: 3000,
              },
            );
            this.isLoading.set(false);
          },
        });
      return;
    }

    const purchaseOrderCreationRequest = {
      supplierId: this.form.controls.header.value.supplierId!,
      estimatedDeliveryDate:
        this.form.controls.header.value.estimatedDeliveryDate!,
      observation: this.form.controls.header.value.observation!,
      purchaseOrderItems: this.items.controls.map((item) => ({
        productId: item.value.productId!,
        quantity: item.value.quantity!,
        unitPrice: item.value.unitPrice!,
      })),
      purchaseOrderStatusId: statusId,
    };

    this.purchaseOrderService
      .createPurchaseOrder(purchaseOrderCreationRequest)
      .subscribe({
        next: () => {
          let message = 'Orden de compra creada con éxito';
          if (statusId === this.STATUS_DRAFT) {
            message = 'Orden de compra guardada como borrador';
          }
          this.snackBar.open(message, 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/ordenes-compra']);
        },
        error: () => {
          this.snackBar.open('Error al crear la orden de compra', 'Cerrar', {
            duration: 3000,
          });
          this.isLoading.set(false);
        },
      });
  }

  goBack() {
    this.router.navigate(['/ordenes-compra']);
  }
}
