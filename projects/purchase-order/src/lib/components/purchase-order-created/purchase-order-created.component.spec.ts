import { ModalComponent } from '@Common-UI';
import {
  ProductService,
  ProductListItem,
  ProductParams,
  SearchProductResponse,
} from '@Product';
import { SupplierResponse, SupplierService } from '@Supplier';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';
import { PurchaseOrderDetail } from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { mockPurchaseOrderDetail } from '../../testing/mock-data.model';

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;
  let supplierService: SupplierService;
  let productService: ProductService;
  let purchaseOrderService: PurchaseOrderService;
  let router: Router;
  let snackBar: MatSnackBar;
  let activatedRoute: ActivatedRoute;

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
          useValue: mockDeep<PurchaseOrderService>(),
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({
              afterClosed: () => of(true),
            }),
          },
        },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    component = fixture.componentInstance;
    supplierService = TestBed.inject(SupplierService);
    productService = TestBed.inject(ProductService);
    purchaseOrderService = TestBed.inject(PurchaseOrderService);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    activatedRoute = TestBed.inject(ActivatedRoute);

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
    jest.spyOn(productService, 'postSearchProduct').mockReturnValue(
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

    it('should NOT call loadInitialData if existingPurchaseOrderId is not set', () => {
      // Arrange
      const getPurchaseOrderByIdSpy = jest
        .spyOn(purchaseOrderService, 'getPurchaseOrderById')
        .mockReturnValue(of(mockPurchaseOrderDetail));

      // Act
      component.ngOnInit();

      // Assert
      expect(getPurchaseOrderByIdSpy).not.toHaveBeenCalled();
    });

    it('should call loadInitialData if existingPurchaseOrderId is set', () => {
      // Arrange
      activatedRoute.snapshot.params = { id: 1 };
      const getPurchaseOrderByIdSpy = jest
        .spyOn(purchaseOrderService, 'getPurchaseOrderById')
        .mockReturnValue(of(mockPurchaseOrderDetail));

      // Act
      component.ngOnInit();

      // Assert
      expect(getPurchaseOrderByIdSpy).toHaveBeenCalled();
    });
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

    it('should update the form with the selected supplier and load products by supplier', fakeAsync(() => {
      // Arrange
      const mockSupplier: SupplierResponse = {
        id: 1,
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        addressId: 1,
      };
      const mockEvent = {
        option: { value: mockSupplier },
      } as MatAutocompleteSelectedEvent;
      const spyLoadProducts = jest.spyOn(component, 'loadProductsBySupplier');

      // Act
      component.onSupplierSelected(mockEvent);
      tick();

      // Assert
      expect(component.form.controls.header.value.supplierId).toBe(
        mockSupplier.id,
      );
      expect(component.form.controls.header.value.supplier).toEqual(
        mockSupplier,
      );
      expect(spyLoadProducts).toHaveBeenCalledWith(mockSupplier.businessName);
    }));
  });

  describe('List columns', () => {
    it('should return the product name for the product column', () => {
      // Arrange
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

      const column = component.productColumns.find((col) => col.key === 'name');
      // Act
      const value = column?.value?.(mockProduct);
      // Assert
      expect(value).toBe(mockProduct.name);
    });

    it('should call onAddProduct when the action is triggered', () => {
      // Arrange
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

      const column = component.productColumns.find(
        (col) => col.key === 'actions',
      );
      const spy = jest.spyOn(component, 'onAddProduct');
      // Act
      column?.actions?.[0].action(mockProduct);
      // Assert
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });

    it('should return the product name for the items column', () => {
      // Arrange
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

      const mockItem = new FormGroup({
        productId: new FormControl(mockProduct.id),
        quantity: new FormControl(2),
        unitPrice: new FormControl(100),
      });

      const column = component.listColumns.find((col) => col.key === 'name');
      jest.spyOn(component, 'getProductName').mockReturnValue(mockProduct.name);
      // Act
      const value = column?.value?.(mockItem);
      // Assert
      expect(value).toBe(mockProduct.name);
    });

    it('should return the quantity as a string for the quantity column', () => {
      // Arrange
      const mockItem = new FormGroup({
        productId: new FormControl(1),
        quantity: new FormControl(2),
        unitPrice: new FormControl(100),
      });

      const column = component.listColumns.find(
        (col) => col.key === 'quantity',
      );
      // Act
      const value = column?.value?.(mockItem);
      // Assert
      expect(value).toBe('2');
    });
  });

  describe('SupplierObjectValidator', () => {
    it('should return null if the supplier exists in the list', () => {
      // Arrange
      component.suppliers = [
        { id: 1, businessName: 'Proveedor A' } as SupplierResponse,
        { id: 2, businessName: 'Proveedor B' } as SupplierResponse,
      ];
      const mockControl: AbstractControl = {
        value: { id: 1, businessName: 'Proveedor A' },
      } as AbstractControl;

      // Act
      const validatorFn = component.supplierObjectValidator();
      const result = validatorFn(mockControl);

      // Assert
      expect(result).toBeNull();
    });

    it('should return { invalidSupplier: true } if the supplier does not exist in the list', () => {
      // Arrange
      component.suppliers = [
        { id: 1, businessName: 'Proveedor A' } as SupplierResponse,
        { id: 2, businessName: 'Proveedor B' } as SupplierResponse,
      ];
      const mockControl: AbstractControl = {
        value: { id: 3, businessName: 'Proveedor C' },
      } as AbstractControl;

      // Act
      const validatorFn = component.supplierObjectValidator();
      const result = validatorFn(mockControl);

      // Assert
      expect(result).toEqual({ invalidSupplier: true });
    });
  });

  describe('loadProductsBySupplier', () => {
    it('should set isLoadingProducts to true and call ProductService with correct params', () => {
      // Arrange
      const supplierBusinessName = 'Proveedor Test';
      const searchText = 'Producto Test';
      component.form.controls.searchText.setValue(searchText);
      const spySetLoading = jest.spyOn(component.isLoadingProducts, 'set');
      const spyPostSearchProduct = jest.spyOn(
        productService,
        'postSearchProduct',
      );

      const expectedParams: ProductParams = {
        page: 1,
        pageSize: 100,
        filters: { supplierBusinessName: [supplierBusinessName] },
        searchText,
      };

      // Act
      component.loadProductsBySupplier(supplierBusinessName);

      // Assert
      expect(spySetLoading).toHaveBeenCalledWith(true);
      expect(spyPostSearchProduct).toHaveBeenCalledWith(expectedParams);
    });

    it('should update products and filteredProducts on successful response', fakeAsync(() => {
      // Arrange
      const supplierBusinessName = 'Proveedor Test';
      const mockResponse: SearchProductResponse = {
        total: 2,
        results: [
          { id: 1, name: 'Producto A' } as ProductListItem,
          { id: 2, name: 'Producto B' } as ProductListItem,
        ],
      };
      jest
        .spyOn(productService, 'postSearchProduct')
        .mockReturnValue(of(mockResponse));
      const spySetLoading = jest.spyOn(component.isLoadingProducts, 'set');

      // Act
      component.loadProductsBySupplier(supplierBusinessName);
      tick();

      // Assert
      expect(component.products).toEqual(mockResponse.results);
      expect(component.filteredProducts).toEqual(mockResponse.results);
      expect(spySetLoading).toHaveBeenCalledWith(false);
    }));
  });

  describe('getProductName', () => {
    it('should return the product name if the product exists', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
      ];

      // Act
      const productName = component.getProductName(1);

      // Assert
      expect(productName).toBe('Producto A');
    });

    it('should return "Producto desconocido" if the product does not exist', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
      ];

      // Act
      const productName = component.getProductName(3);

      // Assert
      expect(productName).toBe('Producto desconocido');
    });

    it('should return "Producto desconocido" if productId is null', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
      ];

      // Act
      const productName = component.getProductName(null);

      // Assert
      expect(productName).toBe('Producto desconocido');
    });
  });

  describe('onSearchProducts', () => {
    it('should filter products based on search text', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
        { id: 3, name: 'Producto C' } as ProductListItem,
      ];
      component.form.controls.searchText.setValue('Producto B');

      // Act
      component.onSearchProducts();

      // Assert
      expect(component.filteredProducts).toEqual([
        { id: 2, name: 'Producto B' } as ProductListItem,
      ]);
    });

    it('should return all products if search text is empty', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
        { id: 3, name: 'Producto C' } as ProductListItem,
      ];
      component.form.controls.searchText.setValue('');

      // Act
      component.onSearchProducts();

      // Assert
      expect(component.filteredProducts).toEqual(component.products);
    });

    it('should handle case-insensitive search', () => {
      // Arrange
      component.products = [
        { id: 1, name: 'Producto A' } as ProductListItem,
        { id: 2, name: 'Producto B' } as ProductListItem,
        { id: 3, name: 'Producto C' } as ProductListItem,
      ];
      component.form.controls.searchText.setValue('producto b');

      // Act
      component.onSearchProducts();

      // Assert
      expect(component.filteredProducts).toEqual([
        { id: 2, name: 'Producto B' } as ProductListItem,
      ]);
    });
  });

  describe('onClearOrder', () => {
    it('should open confirmation dialog when there are items in the order', () => {
      // Arrange
      const spyDialog = jest.spyOn(component.dialog, 'open');
      component.items.push(
        new FormGroup({
          productId: new FormControl(1),
          quantity: new FormControl(2),
          unitPrice: new FormControl(100),
        }),
      );

      // Act
      component.onClearOrder();

      // Assert
      expect(spyDialog).toHaveBeenCalledWith(ModalComponent, {
        data: {
          title: 'Confirmación',
          message:
            'Si cambia de proveedor se eliminará la orden de compra actual. ¿Desea continuar?',
          confirmText: 'Continuar',
          cancelText: 'Volver',
        },
      });
    });

    it('should reset forms if dialog result is true', () => {
      // Arrange
      const spyResetForms = jest.spyOn(component, 'resetForms');
      jest.spyOn(component.dialog, 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<ModalComponent>);

      component.items.push(
        new FormGroup({
          productId: new FormControl(1),
          quantity: new FormControl(2),
          unitPrice: new FormControl(100),
        }),
      );

      // Act
      component.onClearOrder();

      // Assert
      expect(spyResetForms).toHaveBeenCalled();
    });

    it('should reset forms directly if there are no items in the order', () => {
      // Arrange
      const spyResetForms = jest.spyOn(component, 'resetForms');

      // Act
      component.onClearOrder();

      // Assert
      expect(spyResetForms).toHaveBeenCalled();
    });
  });

  describe('resetForms', () => {
    it('should reset the form and clear items', () => {
      // Arrange
      component.items.push(
        new FormGroup({
          productId: new FormControl(1),
          quantity: new FormControl(2),
          unitPrice: new FormControl(100),
        }),
      );

      component.form.controls.header.patchValue({
        supplierId: 1,
        supplier: { id: 1, businessName: 'Proveedor Test' } as SupplierResponse,
        estimatedDeliveryDate: '2025-08-14',
        observation: 'Test observation',
      });

      // Act
      component.resetForms();

      // Assert
      expect(component.form.value).toEqual({
        header: {
          supplierId: null,
          supplier: null,
          estimatedDeliveryDate: null,
          observation: null,
        },
        items: [],
        searchText: null,
      });
      expect(component.items.length).toBe(0);
    });
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

  describe('onCreationSubmit', () => {
    it('should call PurchaseOrderService and show success snackbar on successful submit', fakeAsync(() => {
      //Arrange
      const spyService = jest.spyOn(
        purchaseOrderService,
        'createPurchaseOrder',
      );
      const spySnackBar = jest.spyOn(snackBar, 'open');
      const spyRouter = jest.spyOn(router, 'navigate');
      // Act
      component.onCreationSubmit(component.STATUS_ORDERED);
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

    it('should show draft snackbar message when saving as draft', fakeAsync(() => {
      // Arrange
      const spyService = jest.spyOn(
        purchaseOrderService,
        'createPurchaseOrder',
      );
      const spySnackBar = jest.spyOn(snackBar, 'open');
      const spyRouter = jest.spyOn(router, 'navigate');
      // Act
      component.onCreationSubmit(component.STATUS_DRAFT);
      tick();
      // Assert
      expect(spyService).toHaveBeenCalled();
      expect(spySnackBar).toHaveBeenCalledWith(
        'Orden de compra guardada como borrador',
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
      component.onCreationSubmit(component.STATUS_DRAFT);
      tick();
      // Assert
      expect(spySnackBar).toHaveBeenCalledWith(
        'Error al crear la orden de compra',
        'Cerrar',
        { duration: 3000 },
      );
    }));
  });

  describe('onModifySubmit', () => {
    it('should call updatePurchaseOrderStatusAsync and show success snackbar on successful modification', fakeAsync(() => {
      // Arrange
      component.isModification = true;
      component.existingPurchaseOrderId = 123;
      component.initialPurchaseOrder = {
        id: 123,
        supplier: { id: 1, businessName: 'Proveedor Test' },
        estimatedDeliveryDate: new Date('2025-08-14'),
        observation: 'Test observation',
        status: { id: 2, name: 'Modificada' },
        purchaseOrderItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        effectiveDeliveryDate: null,
        totalAmount: 0,
      } as PurchaseOrderDetail;
      component.form.controls.header.patchValue({
        supplierId: 1,
        supplier: {
          id: 1,
          businessName: 'Proveedor Test',
          addressId: 1,
          documentNumber: '123456789',
          documentType: 'CUIT',
          email: '',
          phone: '',
        },
        estimatedDeliveryDate: '2025-08-14',
        observation: 'Test observation',
      });
      component.items.push(
        new FormGroup({
          productId: new FormControl(1),
          quantity: new FormControl(2),
          unitPrice: new FormControl(100),
        }),
      );
      const spyUpdate = jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(of(void 0));
      const spySnackBar = jest.spyOn(snackBar, 'open');
      const spyRouter = jest.spyOn(router, 'navigate');

      // Act
      component.onModifySubmit();
      tick();

      // Assert
      expect(spyUpdate).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          purchaseOrderStatusId: 2,
          observation: 'Test observation',
          purchaseOrderItems: [{ productId: 1, quantity: 2, unitPrice: 100 }],
        }),
      );
      expect(spySnackBar).toHaveBeenCalledWith(
        'Orden de compra modificada con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(spyRouter).toHaveBeenCalledWith(['/ordenes-compra']);
    }));

    it('should show error snackbar if update fails', fakeAsync(() => {
      // Arrange
      component.isModification = true;
      component.existingPurchaseOrderId = 123;
      component.initialPurchaseOrder = {
        id: 123,
        supplier: { id: 1, businessName: 'Proveedor Test' },
        estimatedDeliveryDate: new Date('2025-08-14'),
        observation: 'Test observation',
        status: { id: 2, name: 'Modificada' },
        purchaseOrderItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        effectiveDeliveryDate: null,
        totalAmount: 0,
      } as PurchaseOrderDetail;
      component.form.controls.header.patchValue({
        supplierId: 1,
        supplier: {
          id: 1,
          businessName: 'Proveedor Test',
          addressId: 1,
          documentNumber: '123456789',
          documentType: 'CUIT',
          email: '',
          phone: '',
        },
        estimatedDeliveryDate: '2025-08-14',
        observation: 'Test observation',
      });
      component.items.push(
        new FormGroup({
          productId: new FormControl(1),
          quantity: new FormControl(2),
          unitPrice: new FormControl(100),
        }),
      );
      jest
        .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
        .mockReturnValue(throwError(() => new Error('Error')));
      const spySnackBar = jest.spyOn(snackBar, 'open');

      // Act
      component.onModifySubmit();
      tick();

      // Assert
      expect(spySnackBar).toHaveBeenCalledWith(
        'Error al modificar la orden de compra',
        'Cerrar',
        { duration: 3000 },
      );
      expect(component.isLoading()).toBe(false);
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

  describe('loadInitialData', () => {
    it('should set initialPurchaseOrder and patch form when existingPurchaseOrderId is set', fakeAsync(() => {
      // Arrange
      const mockPurchaseOrder = {
        id: 123,
        supplier: { id: 1, businessName: 'Proveedor Test' },
        estimatedDeliveryDate: new Date('2025-08-14'),
        observation: 'Test observation',
        status: { id: 2, name: 'Modificada' },
        purchaseOrderItems: [
          { productId: 1, quantity: 2, unitPrice: 100 },
          { productId: 2, quantity: 3, unitPrice: 200 },
        ],
      } as PurchaseOrderDetail;
      jest
        .spyOn(purchaseOrderService, 'getPurchaseOrderById')
        .mockReturnValue(of(mockPurchaseOrder));
      component.existingPurchaseOrderId = mockPurchaseOrder.id;
      component.isModification = true;

      // Act
      component.loadInitialData();
      tick();

      // Assert
      expect(component.initialPurchaseOrder).toEqual(mockPurchaseOrder);
      expect(component.form.controls.header.value.supplierId).toBe(
        mockPurchaseOrder.supplier.id,
      );
      expect(component.form.controls.header.value.observation).toBe(
        mockPurchaseOrder.observation,
      );
      expect(component.items.length).toBe(2);
      expect(component.items.at(0).value.productId).toBe(1);
      expect(component.items.at(1).value.productId).toBe(2);
    }));
  });
});
