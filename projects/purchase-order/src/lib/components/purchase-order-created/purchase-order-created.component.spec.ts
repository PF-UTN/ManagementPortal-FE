import {
  ProductService,
  ProductListItem,
  SearchProductResponse,
} from '@Product';
import { SupplierService, SupplierResponse } from '@Supplier';

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';

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
    supplierService = TestBed.inject(SupplierService);
    productService = TestBed.inject(ProductService);
    jest.spyOn(supplierService, 'getSuppliers').mockReturnValue(of([]));
    component = fixture.componentInstance;
    fixture.detectChanges();
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

    it('should call initSuppliers on initialization', () => {
      //act
      const spy = jest.spyOn(component, 'initSuppliers');
      component.ngOnInit();

      //assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Supplier selection', () => {
    it('should call ProductService to search products by supplier', () => {
      //act
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
      component.loadProductsBySupplier('Proveedor Test');

      //assert
      expect(productService.postSearchProduct).toHaveBeenCalledWith(mockParams);
    });

    it('should call ProductService to search products by supplier', () => {
      //act
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
      component.loadProductsBySupplier('Proveedor Test');

      //assert
      expect(productService.postSearchProduct).toHaveBeenCalledWith(mockParams);
    });

    it('should handle errors when loading products by supplier', () => {
      //act
      jest
        .spyOn(productService, 'postSearchProduct')
        .mockReturnValue(
          throwError(() => new Error('Error al cargar productos')),
        );
      component.loadProductsBySupplier('Proveedor Test');

      //assert
      expect(component.isLoadingProducts()).toBe(false);
    });

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
  });

  describe('Submit functionality', () => {
    it('should prepare the purchase order correctly', () => {
      //act
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
      const spy = jest.spyOn(console, 'log');
      component.onSubmit();

      //assert
      expect(spy).toHaveBeenCalledWith({
        supplierId: mockSupplier.id,
        estimatedDeliveryDate: '2025-08-13',
        observation: 'Observación Test',
        purchaseOrderItems: [
          { productId: mockProduct.id, quantity: 2, unitPrice: 100 },
        ],
      });
    });
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
