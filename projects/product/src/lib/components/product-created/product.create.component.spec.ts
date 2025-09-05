import { LateralDrawerService } from '@Common-UI';
import { CreateUpdateProductCategoryLateralDrawerComponent } from '@Product-Category';
import {
  CreateUpdateSupplierLateralDrawerComponent,
  SupplierResponse,
  SupplierService,
} from '@Supplier';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { ProductCreateComponent } from './product-create.component';
import { ProductCategoryResponse } from '../../models/product-category-response.model';
import { ProductResponse } from '../../models/product-create-response.model';
import { ProductService } from '../../services/product.service';

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;
  let fixture: ComponentFixture<ProductCreateComponent>;
  let productServiceMock: {
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    getCategories: jest.Mock;
    getProductById: jest.Mock;
    changeProductStock: jest.Mock;
  };
  let supplierServiceMock: { getSuppliers: jest.Mock };
  let snackBarMock: { open: jest.Mock };
  let routerMock: { navigate: jest.Mock; url: string };
  let lateralDrawerService: LateralDrawerService;

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
      updateProduct: jest.fn(),
      getCategories: jest.fn().mockReturnValue(of(mockCategories)),
      getProductById: jest.fn(),
      changeProductStock: jest.fn(),
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
              queryParamMap: { get: () => null },
            },
            paramMap: of({ get: () => null }),
          },
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    lateralDrawerService = TestBed.inject(LateralDrawerService);

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
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));

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

    it('should call updateProduct and navigate on success when editing', fakeAsync(() => {
      // arrange
      jest
        .spyOn(component['route'].snapshot.paramMap, 'get')
        .mockReturnValue('5');
      productServiceMock.updateProduct = jest
        .fn()
        .mockReturnValue(of(mockProductResponse));
      component.ngOnInit();
      tick();
      component.productForm.patchValue({
        name: 'Edit',
        description: 'EditDesc',
        price: 2,
        enabled: true,
        weight: 2,
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
      component.onSubmit();

      // assert
      expect(productServiceMock.updateProduct).toHaveBeenCalledWith(
        5,
        expect.any(Object),
      );
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Producto actualizado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
    }));

    it('should handle error on updateProduct', fakeAsync(() => {
      // arrange
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));
      jest
        .spyOn(component['route'].snapshot.paramMap, 'get')
        .mockReturnValue('5');
      productServiceMock.updateProduct = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('fail')));
      component.ngOnInit();
      tick();
      component.productForm.patchValue({
        name: 'Edit',
        description: 'EditDesc',
        price: 2,
        enabled: true,
        weight: 2,
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
      component.onSubmit();

      // assert
      expect(productServiceMock.updateProduct).toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalledWith(
        'Producto actualizado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
    }));

    describe('onSubmit (stockOnlyMode)', () => {
      beforeEach(() => {
        jest
          .spyOn(component['route'].snapshot.paramMap, 'get')
          .mockImplementation((key: string) => {
            if (key === 'id') return '1';
            if (key === 'stockOnly') return 'true';
            return null;
          });
        jest
          .spyOn(component['route'].snapshot.queryParamMap, 'get')
          .mockImplementation((key: string) => {
            if (key === 'stockOnly') return 'true';
            return null;
          });

        component.stockOnlyMode = true;
        component.ngOnInit();
        fixture.detectChanges();

        productServiceMock.changeProductStock = jest.fn();
        productServiceMock.getProductById = jest.fn().mockReturnValue(
          of({
            id: 1,
            stock: {
              quantityAvailable: 10,
              quantityReserved: 5,
              quantityOrdered: 2,
            },
          }),
        );
        component.productForm.patchValue({
          stock: {
            quantityAvailable: 15,
            quantityReserved: 5,
            quantityOrdered: 2,
          },
          stockReason: 'Ajuste por inventario',
        });
      });

      it('should call changeProductStock with correct params and navigate on success', fakeAsync(() => {
        // Arrange
        productServiceMock.changeProductStock.mockReturnValue(of(undefined));
        // Act
        component.onSubmit();
        tick();
        fixture.detectChanges();
        tick();
        // Assert
        expect(productServiceMock.changeProductStock).toHaveBeenCalledWith({
          productId: 1,
          changes: [
            {
              changedField: 'Available',
              previousValue: 10,
              newValue: 15,
            },
          ],
          reason: 'Ajuste por inventario',
        });
        expect(snackBarMock.open).toHaveBeenCalledWith(
          'Stock ajustado correctamente',
          'Cerrar',
          { duration: 3000 },
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
      }));

      it('should show message if no stock changes', fakeAsync(() => {
        // Arrange
        productServiceMock.getProductById.mockReturnValue(
          of({
            id: 1,
            stock: {
              quantityAvailable: 15,
              quantityReserved: 5,
              quantityOrdered: 2,
            },
          }),
        );
        // Act
        component.onSubmit();
        tick();
        fixture.detectChanges();
        tick();
        // Assert
        expect(productServiceMock.changeProductStock).not.toHaveBeenCalled();
        expect(snackBarMock.open).toHaveBeenCalledWith(
          'No hay cambios en el stock',
          'Cerrar',
          { duration: 3000 },
        );
      }));

      it('should handle error on changeProductStock', fakeAsync(() => {
        // Arrange
        productServiceMock.changeProductStock.mockReturnValue(
          throwError(() => new Error('fail')),
        );
        // Act
        component.onSubmit();
        tick();
        fixture.detectChanges();
        tick();
        // Assert
        expect(productServiceMock.changeProductStock).toHaveBeenCalled();
        expect(snackBarMock.open).not.toHaveBeenCalledWith(
          'Stock ajustado correctamente',
          'Cerrar',
          { duration: 3000 },
        );
        expect(routerMock.navigate).not.toHaveBeenCalled();
      }));

      it('should call changeProductStock with correct params and navigate on success', fakeAsync(() => {
        // Arrange
        productServiceMock.changeProductStock.mockReturnValue(of(undefined));
        // Act
        component.onSubmit();
        tick();
        fixture.detectChanges();
        tick();
        // Assert
        expect(productServiceMock.changeProductStock).toHaveBeenCalledWith({
          productId: 1,
          changes: [
            {
              changedField: 'Available',
              previousValue: 10,
              newValue: 15,
            },
          ],
          reason: 'Ajuste por inventario',
        });
        expect(snackBarMock.open).toHaveBeenCalledWith(
          'Stock ajustado correctamente',
          'Cerrar',
          { duration: 3000 },
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
      }));
    });
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

  describe('filterCategories', () => {
    it('should filter categories by name (case insensitive)', () => {
      // arrange
      component.categories = [
        { id: 1, name: 'Alimentos', description: '' },
        { id: 2, name: 'Juguetes', description: '' },
        { id: 3, name: 'Accesorios', description: '' },
      ];
      // act
      const result = component['filterCategories']('ali');
      // assert
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Alimentos');
    });

    it('should return empty array if no match', () => {
      // arrange
      component.categories = [{ id: 1, name: 'Alimentos', description: '' }];
      // act
      const result = component['filterCategories']('zzz');
      // assert
      expect(result.length).toBe(0);
    });
  });

  describe('filterSuppliers', () => {
    it('should filter suppliers by businessName (case insensitive)', () => {
      // arrange
      component.suppliers = [
        {
          id: 1,
          businessName: 'Proveedor Uno',
          documentType: '',
          documentNumber: '',
          email: '',
          phone: '',
          addressId: 1,
        },
        {
          id: 2,
          businessName: 'Proveedor Dos',
          documentType: '',
          documentNumber: '',
          email: '',
          phone: '',
          addressId: 2,
        },
      ];
      // act
      const result = component['filterSuppliers']('uno');
      // assert
      expect(result.length).toBe(1);
      expect(result[0].businessName).toBe('Proveedor Uno');
    });

    it('should return empty array if no match', () => {
      // arrange
      component.suppliers = [
        {
          id: 1,
          businessName: 'Proveedor Uno',
          documentType: '',
          documentNumber: '',
          email: '',
          phone: '',
          addressId: 1,
        },
      ];
      // act
      const result = component['filterSuppliers']('zzz');
      // assert
      expect(result.length).toBe(0);
    });
  });

  describe('onCategorySelected', () => {
    it('should set categoryId in form', () => {
      // arrange
      const category: ProductCategoryResponse = {
        id: 123,
        name: 'Alimentos',
        description: '',
      };
      const event = {
        option: { value: category },
      } as MatAutocompleteSelectedEvent;

      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));

      component.productForm.patchValue({ categoryId: null });
      // act
      component.onCategorySelected(event);
      // assert
      expect(component.productForm.controls.categoryId.value).toBe(123);
    });
    it('should call onCreateUpdateProductCategoryDrawer if + Gestionar categoria was selected', () => {
      //Arrange
      const event = {
        option: { value: component.MANAGE_CATEGORY_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;

      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));

      const spy = jest.spyOn(component, 'onCreateUpdateProductCategoryDrawer');

      // Act
      component.onCategorySelected(event);

      // Assert
      expect(spy).toHaveBeenCalled();
    });
    it('should open CreateUpdateProductCategoryLateralDrawerComponent with correct params when onCreateUpdateProductCategoryDrawer is called', () => {
      // Arrange
      const event = {
        option: { value: component.MANAGE_CATEGORY_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;

      const spy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockReturnValue(of(undefined));

      // Act
      component.onCategorySelected(event);

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        CreateUpdateProductCategoryLateralDrawerComponent,
        {},
        expect.objectContaining({
          title: 'Gestionar Categoría',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Confirmar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });

  describe('onSupplierSelected', () => {
    it('debería setear el supplierId en el form', () => {
      // arrange
      const supplier: SupplierResponse = {
        id: 456,
        businessName: 'Proveedor Uno',
        documentType: '',
        documentNumber: '',
        email: '',
        phone: '',
        addressId: 1,
      };
      const event = {
        option: { value: supplier },
      } as MatAutocompleteSelectedEvent;

      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));

      component.productForm.patchValue({ supplierId: null });
      // act
      component.onSupplierSelected(event);
      // assert
      expect(component.productForm.controls.supplierId.value).toBe(456);
    });
    it('should call onCreateUpdateSipplierDrawer if + Gestionar proveedor was selected', () => {
      //Arrange
      const event = {
        option: { value: component.MANAGE_SUPPLIER_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;

      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(undefined));

      const spy = jest.spyOn(component, 'onCreateUpdateSupplierDrawer');

      // Act
      component.onSupplierSelected(event);

      // Assert
      expect(spy).toHaveBeenCalled();
    });
    it('should open CreateUpdateSupplierLateralDrawerComponent with correct params when onCreateUpdatSupplierDrawer is called', () => {
      //Arrange
      const event = {
        option: { value: component.MANAGE_SUPPLIER_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;

      const spy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockReturnValue(of(undefined));

      // Act
      component.onSupplierSelected(event);

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        CreateUpdateSupplierLateralDrawerComponent,
        {},
        expect.objectContaining({
          title: 'Gestionar Proveedor',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Confirmar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });

  describe('showBackArrow', () => {
    it('should return false if url ends with /productos', () => {
      // act
      routerMock.url = '/productos';
      // assert
      expect(component.showBackArrow).toBe(false);
    });

    it('should navigate to /productos', () => {
      // act
      component.goBack();
      // assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
    });
    it('should return true if url does not end with /productos', () => {
      // act
      routerMock.url = '/productos/crear';
      // assert
      expect(component.showBackArrow).toBe(true);
    });
  });
});
