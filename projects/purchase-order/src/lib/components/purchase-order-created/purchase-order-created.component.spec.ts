import { ProductService, ProductListItem } from '@Product';
import { SupplierResponse, SupplierService } from '@Supplier';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;
  let supplierService: SupplierService;
  let productService: ProductService;
  let purchaseOrderService: PurchaseOrderService;
  let router: Router;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        PurchaseOrderCreatedComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: SupplierService, useValue: { getSuppliers: jest.fn() } },
        { provide: ProductService, useValue: { postSearchProduct: jest.fn() } },
        {
          provide: PurchaseOrderService,
          useValue: { createPurchaseOrder: jest.fn() },
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    component = fixture.componentInstance;
    supplierService = TestBed.inject(SupplierService);
    productService = TestBed.inject(ProductService);
    purchaseOrderService = TestBed.inject(PurchaseOrderService);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);

    jest.spyOn(supplierService, 'getSuppliers').mockReturnValue(
      of([
        {
          id: 1,
          businessName: 'Proveedor Test',
          documentType: 'CUIT',
          documentNumber: '123456789',
          email: 'test@proveedor.com',
          phone: '123456789',
          addressId: 1,
        } as SupplierResponse,
      ]),
    );
    jest
      .spyOn(productService, 'postSearchProduct')
      .mockReturnValue(
        of({
          total: 1,
          results: [{ id: 1, name: 'Producto Test' } as ProductListItem],
        }),
      );
    jest
      .spyOn(purchaseOrderService, 'createPurchaseOrder')
      .mockReturnValue(of({}));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      // Act
      const isComponentCreated = !!component;

      // Assert
      expect(isComponentCreated).toBeTruthy();
    });

    it('should initialize the form correctly', () => {
      // Act
      const formControls = component.form.controls;

      // Assert
      expect(formControls.header).toBeDefined();
      expect(formControls.items).toBeDefined();
      expect(formControls.searchText).toBeDefined();
    });

    it('should call initSuppliers on initialization', fakeAsync(() => {
      const spy = jest.spyOn(component, 'initSuppliers');
      // Act
      component.ngOnInit();
      tick();
      // Assert
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('Supplier selection', () => {
    it('should filter suppliers based on search text', fakeAsync(() => {
      component.suppliers = [
        { id: 1, businessName: 'Proveedor A' } as SupplierResponse,
        { id: 2, businessName: 'Proveedor B' } as SupplierResponse,
      ];
      const searchText = 'Proveedor A';
      // Act
      const filteredSuppliers = component.filterSuppliers(searchText);
      tick();
      // Assert
      expect(filteredSuppliers).toEqual([
        { id: 1, businessName: 'Proveedor A' } as SupplierResponse,
      ]);
    }));
  });

  describe('Product management', () => {
    it('should add a product to the items array', () => {
      //Arrange
      const mockProduct: ProductListItem = {
        id: 1,
        name: 'Producto Test',
        description: 'Descripción del producto',
        price: 100,
        categoryName: 'Categoría Test',
        supplierBusinessName: 'Proveedor Test',
        stock: 50,
        weight: 1.5,
        enabled: true,
      };
      // Act
      component.onAddProduct(mockProduct);
      // Assert
      expect(component.items.length).toBe(1);
      expect(component.items.controls[0].value.productId).toBe(mockProduct.id);
    });

    it('should remove a product from the items array', () => {
      //Arrange
      const mockProduct: ProductListItem = {
        id: 1,
        name: 'Producto Test',
        description: 'Descripción del producto',
        price: 100,
        categoryName: 'Categoría Test',
        supplierBusinessName: 'Proveedor Test',
        stock: 50,
        weight: 1.5,
        enabled: true,
      };
      component.onAddProduct(mockProduct);
      // Act
      component.removeProduct(mockProduct.id);
      // Assert
      expect(component.items.length).toBe(0);
    });

    it('should calculate the total correctly', () => {
      // Arrange
      const mockProduct1: ProductListItem = {
        id: 1,
        name: 'Producto Test',
        description: 'Descripción del producto',
        price: 100,
        categoryName: 'Categoría Test',
        supplierBusinessName: 'Proveedor Test',
        stock: 50,
        weight: 1.5,
        enabled: true,
      };
      const mockProduct2: ProductListItem = {
        id: 2,
        name: 'Producto Test 2',
        description: 'Descripción del producto 2',
        price: 200,
        categoryName: 'Categoría Test 2',
        supplierBusinessName: 'Proveedor Test 2',
        stock: 30,
        weight: 2.0,
        enabled: true,
      };
      component.onAddProduct(mockProduct1);
      component.onAddProduct(mockProduct2);
      component.items.controls[0].patchValue({ quantity: 2, unitPrice: 100 });
      component.items.controls[1].patchValue({ quantity: 3, unitPrice: 200 });
      // Act
      const total = component.calculateTotal();
      // Assert
      expect(total).toBe(800);
    });
  });

  describe('Submit functionality', () => {
    it('should call PurchaseOrderService and show success snackbar on successful submit', fakeAsync(() => {
      //Arrange
      const spyService = jest.spyOn(
        purchaseOrderService,
        'createPurchaseOrder',
      );
      const spySnackBar = jest.spyOn(snackBar, 'open');
      const spyRouter = jest.spyOn(router, 'navigate');
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(spyService).toHaveBeenCalled();
      expect(spySnackBar).toHaveBeenCalledWith(
        'Orden de compra creada con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(spyRouter).toHaveBeenCalledWith(['/ordenes-compra']);
    }));

    it('should show error snackbar if submit fails', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(purchaseOrderService, 'createPurchaseOrder')
        .mockReturnValue(throwError(() => new Error('Error')));
      const spySnackBar = jest.spyOn(snackBar, 'open');
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(spySnackBar).toHaveBeenCalledWith(
        'Error al crear la orden de compra',
        'Cerrar',
        { duration: 3000 },
      );
    }));
  });

  describe('Navigation', () => {
    it('should navigate to purchase orders list', () => {
      // Arrange
      const spy = jest.spyOn(router, 'navigate');
      // Act
      component.goBack();
      // Assert
      expect(spy).toHaveBeenCalledWith(['/ordenes-compra']);
    });
  });
});
