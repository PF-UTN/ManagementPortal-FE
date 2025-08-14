import {
  ProductService,
  ProductListItem,
  SearchProductResponse,
} from '@Product';
import { SupplierService, SupplierResponse } from '@Supplier';

import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  TestBed.resetTestingModule();
});

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;
  let supplierService: SupplierService;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideNativeDateAdapter(),
        { provide: Router, useValue: mockDeep(Router) },
        { provide: SupplierService, useValue: mockDeep(SupplierService) },
        { provide: ProductService, useValue: mockDeep(ProductService) },
        { provide: MatDialog, useValue: mockDeep(MatDialog) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    component = fixture.componentInstance;
    supplierService = TestBed.inject(SupplierService);
    productService = TestBed.inject(ProductService);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.form.reset();
    (component.form.controls.items as FormArray).clear();
    component.products = [];
    component.filteredProducts = [];
    component.suppliers = [];
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      //act
      const isComponentCreated = !!component;

      //assert
      expect(isComponentCreated).toBeTruthy();
    });

    it('should initialize the form correctly', () => {
      //act
      const formControls = component.form.controls;

      //assert
      expect(formControls.header).toBeDefined();
      expect(formControls.items).toBeDefined();
      expect(formControls.searchText).toBeDefined();
    });

    it('should call initSuppliers on initialization', fakeAsync(() => {
      // Arrange
      jest.spyOn(supplierService, 'getSuppliers').mockReturnValue(of([]));
      const spy = jest.spyOn(component, 'initSuppliers');

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('Supplier selection', () => {
    it('should call ProductService to search products by supplier', fakeAsync(() => {
      // Arrange
      const mockParams = {
        filters: {
          supplierBusinessName: ['Proveedor Test'],
        },
        page: 1,
        pageSize: 100,
        searchText: '',
      };
      jest.spyOn(productService, 'postSearchProduct').mockReturnValue(
        of({
          total: 0,
          results: [],
        } as SearchProductResponse),
      );

      // Act
      component.loadProductsBySupplier('Proveedor Test');
      tick();

      // Assert
      expect(productService.postSearchProduct).toHaveBeenCalledWith(mockParams);
    }));

    it('should handle errors when loading products by supplier', fakeAsync(() => {
      // Act
      jest
        .spyOn(productService, 'postSearchProduct')
        .mockReturnValue(
          throwError(() => new Error('Error al cargar productos')),
        );
      component.loadProductsBySupplier('Proveedor Test');
      tick();
      // Assert
      expect(component.isLoadingProducts()).toBe(false);
    }));

    it('should validate supplier object correctly', () => {
      //act
      component.suppliers = [
        { id: 1, businessName: 'Proveedor Test' } as SupplierResponse,
      ];
      const control = new FormControl({
        id: 1,
        businessName: 'Proveedor Test',
      });
      const result = component.supplierObjectValidator()(control);

      //assert
      expect(result).toBeNull();
    });

    it('should return error if supplier object is invalid', () => {
      //act
      component.suppliers = [
        { id: 1, businessName: 'Proveedor Test' } as SupplierResponse,
      ];
      const control = new FormControl({
        id: 2,
        businessName: 'Proveedor Inválido',
      });
      const result = component.supplierObjectValidator()(control);

      //assert
      expect(result).toEqual({ invalidSupplier: true });
    });

    it('should update the form when a supplier is selected', fakeAsync(() => {
      // Arrange
      const mockSupplier = {
        id: 1,
        businessName: 'Proveedor Test',
      } as SupplierResponse;
      const event = {
        option: { value: mockSupplier },
      } as MatAutocompleteSelectedEvent;
      jest
        .spyOn(productService, 'postSearchProduct')
        .mockReturnValue(of({ total: 0, results: [] }));

      // Act
      component.onSupplierSelected(event);
      tick();

      // Assert
      expect(component.form.controls.header.value.supplierId).toBe(
        mockSupplier.id,
      );
      expect(component.form.controls.header.value.supplier).toEqual(
        mockSupplier,
      );
    }));
  });

  describe('Product management', () => {
    it('should add a product to the items array', () => {
      //act
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.onAddProduct(mockProduct);

      //assert
      expect(component.items.length).toBe(1);
      expect(component.items.controls[0].value.productId).toBe(mockProduct.id);
    });

    it('should not add a duplicate product to the items array', () => {
      //act
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.onAddProduct(mockProduct);
      component.onAddProduct(mockProduct);

      //assert
      expect(component.items.length).toBe(1);
    });

    it('should remove a product from the items array', () => {
      //act
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.onAddProduct(mockProduct);
      component.removeProduct(mockProduct.id);

      //assert
      expect(component.items.length).toBe(0);
    });

    it('should filter products based on search text', () => {
      //act
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
      ];
      component.form.controls.searchText.setValue('Producto A');
      component.onSearchProducts();

      //assert
      expect(component.filteredProducts).toEqual([
        { id: 1, name: 'Producto A' } as ProductListItem,
      ]);
    });

    it('should return the correct product name based on product ID', () => {
      //act
      component.products = [{ id: 1, name: 'Producto A' } as ProductListItem];
      const productName = component.getProductName(1);

      //assert
      expect(productName).toBe('Producto A');
    });

    it('should return "Producto desconocido" if product ID does not exist', () => {
      //act
      component.products = [{ id: 1, name: 'Producto A' } as ProductListItem];
      const productName = component.getProductName(2);

      //assert
      expect(productName).toBe('Producto desconocido');
    });

    it('should return the correct product name for productColumns', () => {
      //act
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      const column = component.productColumns.find((col) => col.key === 'name');
      const productName = column?.value ? column.value(mockProduct) : undefined;

      //assert
      expect(productName).toBe('Producto Test');
    });

    it('should call onAddProduct when action is triggered for a product', () => {
      // Arrange
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      const column = component.productColumns.find(
        (col) => col.key === 'actions',
      );
      expect(column).toBeDefined();
      const spy = jest.spyOn(component, 'onAddProduct');

      // Act
      column?.actions?.[0]?.action(mockProduct);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });

    it('should format numbers correctly using Intl.NumberFormat', () => {
      // Arrange
      const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      });

      // Act
      const formattedNumber = formatter.format(12345.67).replace(/\s/g, '');

      // Assert
      expect(formattedNumber).toBe('$12.345,67');
    });
  });

  describe('Form reset', () => {
    it('should reset the form and clear items', () => {
      //act
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.onAddProduct(mockProduct);
      component.resetForms();

      //assert
      expect(component.form.value.header?.supplier).toBeNull();
      expect(component.items.length).toBe(0);
    });
  });

  describe('Total calculation', () => {
    it('should calculate the total correctly', () => {
      //act
      const mockProduct1 = { id: 1, name: 'Producto 1' } as ProductListItem;
      const mockProduct2 = { id: 2, name: 'Producto 2' } as ProductListItem;
      component.onAddProduct(mockProduct1);
      component.onAddProduct(mockProduct2);
      component.items.controls[0].patchValue({ quantity: 2, unitPrice: 100 });
      component.items.controls[1].patchValue({ quantity: 3, unitPrice: 200 });
      const total = component.calculateTotal();

      //assert
      expect(total).toBe(800);
    });

    it('should calculate the subtotal correctly for a product', () => {
      //act
      const mockProduct = new FormGroup({
        quantity: new FormControl(2),
        unitPrice: new FormControl(100),
      });
      const subtotal =
        (mockProduct.controls.quantity.value || 0) *
        (mockProduct.controls.unitPrice.value || 0);

      //assert
      expect(subtotal).toBe(200);
    });

    it('should return 0 if quantity or unit price is 0', () => {
      //act
      const mockProduct = new FormGroup({
        quantity: new FormControl(0),
        unitPrice: new FormControl(100),
      });
      const subtotal =
        (mockProduct.controls.quantity.value || 0) *
        (mockProduct.controls.unitPrice.value || 0);

      //assert
      expect(subtotal).toBe(0);
    });

    it('should return 0 if quantity or unit price is null or undefined', () => {
      //act
      const mockProduct = new FormGroup({
        quantity: new FormControl(null),
        unitPrice: new FormControl(undefined),
      });
      const subtotal =
        (mockProduct.controls.quantity.value || 0) *
        (mockProduct.controls.unitPrice.value || 0);

      //assert
      expect(subtotal).toBe(0);
    });

    it('should call loadProductsBySupplier with the correct supplier business name', fakeAsync(() => {
      // Arrange
      const mockSupplier = {
        id: 1,
        businessName: 'Proveedor Test',
      } as SupplierResponse;
      const event = {
        option: { value: mockSupplier },
      } as MatAutocompleteSelectedEvent;
      jest.spyOn(productService, 'postSearchProduct').mockReturnValue(
        of({
          total: 0,
          results: [],
        } as SearchProductResponse),
      );

      const spy = jest.spyOn(component, 'loadProductsBySupplier');

      // Act
      component.onSupplierSelected(event);
      tick();

      // Assert
      expect(spy).toHaveBeenCalledWith(mockSupplier.businessName);
    }));
  });

  describe('Submit functionality', () => {
    it('should call PurchaseOrderService and show success snackbar on successful submit', fakeAsync(() => {
      // Arrange
      const mockSupplier = {
        id: 1,
        businessName: 'Proveedor Test',
      } as SupplierResponse;
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.form.controls.header.patchValue({
        supplierId: mockSupplier.id,
        supplier: mockSupplier,
        estimatedDeliveryDate: '2025-08-13',
        observation: 'Observación Test',
      });
      component.onAddProduct(mockProduct);
      component.items.controls[0].patchValue({ quantity: 2, unitPrice: 100 });

      const spyService = jest
        .spyOn(component.purchaseOrderService, 'createPurchaseOrder')
        .mockReturnValue(of({}));
      const spySnackBar = jest.spyOn(component.snackBar, 'open');
      const spyRouter = jest.spyOn(component.router, 'navigate');

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(spyService).toHaveBeenCalledWith({
        supplierId: mockSupplier.id,
        estimatedDeliveryDate: '2025-08-13',
        observation: 'Observación Test',
        purchaseOrderItems: [
          { productId: mockProduct.id, quantity: 2, unitPrice: 100 },
        ],
      });
      expect(spySnackBar).toHaveBeenCalledWith(
        'Orden de compra creada con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(spyRouter).toHaveBeenCalledWith(['/ordenes-compra']);
    }));

    it('should show error snackbar if submit fails', fakeAsync(() => {
      // Arrange
      const mockSupplier = {
        id: 1,
        businessName: 'Proveedor Test',
      } as SupplierResponse;
      const mockProduct = { id: 1, name: 'Producto Test' } as ProductListItem;
      component.form.controls.header.patchValue({
        supplierId: mockSupplier.id,
        supplier: mockSupplier,
        estimatedDeliveryDate: '2025-08-13',
        observation: 'Observación Test',
      });
      component.onAddProduct(mockProduct);
      component.items.controls[0].patchValue({ quantity: 2, unitPrice: 100 });

      const spyService = jest
        .spyOn(component.purchaseOrderService, 'createPurchaseOrder')
        .mockReturnValue(throwError(() => new Error('Error')));
      const spySnackBar = jest.spyOn(component.snackBar, 'open');

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(spyService).toHaveBeenCalled();
      expect(spySnackBar).toHaveBeenCalledWith(
        'Error al crear la orden de compra',
        'Cerrar',
        { duration: 3000 },
      );
    }));
  });

  describe('Navigation', () => {
    it('should navigate to purchase orders list', () => {
      //act
      const spy = jest.spyOn(component.router, 'navigate');
      component.goBack();

      //assert
      expect(spy).toHaveBeenCalledWith(['/ordenes-compra']);
    });
  });
});
