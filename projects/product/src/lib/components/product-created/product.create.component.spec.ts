import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductCreateComponent } from './product-create.component';
import { ProductCategoryResponse } from '../../models/product-category-response.model';
import { ProductResponse } from '../../models/product-create-response.model';
import { SupplierResponse } from '../../models/supplier-response.model';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;
  let fixture: ComponentFixture<ProductCreateComponent>;
  let productServiceMock: {
    createProduct: jest.Mock;
    getCategories: jest.Mock;
  };
  let supplierServiceMock: { getSuppliers: jest.Mock };
  let snackBarMock: { open: jest.Mock };
  let routerMock: { navigate: jest.Mock; url: string };

  const mockCategories: ProductCategoryResponse[] = [
    { id: 1, name: 'Cat1', description: 'desc1' },
    { id: 2, name: 'Cat2', description: 'desc2' },
  ];
  const mockSuppliers: SupplierResponse[] = [
    {
      id: 1,
      businessName: 'Supplier1',
      documentType: 'DNI',
      documentNumber: '123',
      email: 'mail@mail.com',
      phone: '123',
      addressId: 1,
    },
  ];
  const mockProductResponse: ProductResponse = {
    id: 1,
    name: 'Prod',
    description: 'desc',
    price: '10',
    enabled: true,
    weight: '1',
    categoryId: 1,
    supplierId: 1,
    category: { name: 'Cat1', description: 'desc1' },
    supplier: { businessName: 'Supplier1' },
  };

  beforeEach(async () => {
    productServiceMock = {
      createProduct: jest.fn(),
      getCategories: jest.fn().mockReturnValue(of(mockCategories)),
    };
    supplierServiceMock = {
      getSuppliers: jest.fn().mockReturnValue(of(mockSuppliers)),
    };
    snackBarMock = { open: jest.fn() };
    routerMock = { navigate: jest.fn(), url: '/productos/crear' };

    await TestBed.configureTestingModule({
      imports: [
        ProductCreateComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: SupplierService, useValue: supplierServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ngOnInit', () => {
    it('should load categories and suppliers and set up filtered observables', fakeAsync(() => {
      // act
      component.ngOnInit();
      tick();
      // assert
      expect(productServiceMock.getCategories).toHaveBeenCalled();
      expect(supplierServiceMock.getSuppliers).toHaveBeenCalled();
      expect(component.categories.length).toBe(2);
      expect(component.suppliers.length).toBe(1);
    }));
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      // act
      const valid = component.productForm.valid;
      // assert
      expect(valid).toBe(false);
    });

    it('should be valid when all required fields are filled', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();
      component.productForm.patchValue({
        name: 'Test',
        description: 'Desc',
        price: 1,
        enabled: true,
        weight: 1,
        category: mockCategories[0],
        categoryId: 1,
        supplier: mockSuppliers[0],
        supplierId: 1,
        stock: {
          quantityOrdered: 1,
          quantityAvailable: 1,
          quantityReserved: 1,
        },
      });
      // act
      const valid = component.productForm.valid;
      // assert
      expect(valid).toBe(true);
    }));
  });

  describe('onSubmit', () => {
    it('should not call createProduct if form is invalid', () => {
      // act
      component.productForm.patchValue({ name: '' }); // invalid
      component.onSubmit();
      // assert
      expect(productServiceMock.createProduct).not.toHaveBeenCalled();
    });

    it('should call createProduct and navigate on success', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();
      component.productForm.patchValue({
        name: 'Test',
        description: 'Desc',
        price: 1,
        enabled: true,
        weight: 1,
        category: mockCategories[0],
        categoryId: 1,
        supplier: mockSuppliers[0],
        supplierId: 1,
        stock: {
          quantityOrdered: 1,
          quantityAvailable: 1,
          quantityReserved: 1,
        },
      });
      productServiceMock.createProduct.mockReturnValue(of(mockProductResponse));
      // act
      component.onSubmit();
      // assert
      expect(productServiceMock.createProduct).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Producto creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
    }));

    it('should handle error on createProduct', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();
      component.productForm.patchValue({
        name: 'Test',
        description: 'Desc',
        price: 1,
        enabled: true,
        weight: 1,
        category: mockCategories[0],
        categoryId: 1,
        supplier: mockSuppliers[0],
        supplierId: 1,
        stock: {
          quantityOrdered: 1,
          quantityAvailable: 1,
          quantityReserved: 1,
        },
      });
      productServiceMock.createProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      // act
      component.onSubmit();
      // assert
      expect(productServiceMock.createProduct).toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalledWith(
        'Producto creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('UI helpers', () => {
    it('should displaySupplier return correct value', () => {
      // act
      const result1 = component.displaySupplier(mockSuppliers[0]);
      const result2 = component.displaySupplier(
        null as unknown as SupplierResponse,
      );
      // assert
      expect(result1).toBe('Supplier1');
      expect(result2).toBe('');
    });

    it('should displayCategory return correct value', () => {
      // act
      const result1 = component.displayCategory(mockCategories[0]);
      const result2 = component.displayCategory(
        null as unknown as ProductCategoryResponse,
      );
      // assert
      expect(result1).toBe('Cat1');
      expect(result2).toBe('');
    });
  });

  describe('categoryObjectValidator', () => {
    it('should return null for valid category', () => {
      // act
      const validator = component.categoryObjectValidator(mockCategories);
      const control: AbstractControl = {
        value: mockCategories[0],
      } as AbstractControl;
      const result = validator(control);
      // assert
      expect(result).toBeNull();
    });
    it('should return error for invalid category', () => {
      // act
      const validator = component.categoryObjectValidator(mockCategories);
      const control: AbstractControl = {
        value: { id: 999, name: '', description: '' },
      } as AbstractControl;
      const result = validator(control);
      // assert
      expect(result).toEqual({ invalidCategory: true });
    });
  });

  describe('supplierObjectValidator', () => {
    it('should return null for valid supplier', () => {
      // act
      const validator = component.supplierObjectValidator(mockSuppliers);
      const control: AbstractControl = {
        value: mockSuppliers[0],
      } as AbstractControl;
      const result = validator(control);
      // assert
      expect(result).toBeNull();
    });
    it('should return error for invalid supplier', () => {
      // act
      const validator = component.supplierObjectValidator(mockSuppliers);
      const control: AbstractControl = {
        value: {
          id: 999,
          businessName: '',
          documentType: '',
          documentNumber: '',
          email: '',
          phone: '',
          address: '',
        },
      } as AbstractControl;
      const result = validator(control);
      // assert
      expect(result).toEqual({ invalidSupplier: true });
    });
  });

  describe('showBackArrow', () => {
    it('should return false if url ends with /productos', () => {
      // act
      routerMock.url = '/productos';
      // assert
      expect(component.showBackArrow).toBe(false);
    });
    it('should return true if url does not end with /productos', () => {
      // act
      routerMock.url = '/productos/crear';
      // assert
      expect(component.showBackArrow).toBe(true);
    });
  });
});
