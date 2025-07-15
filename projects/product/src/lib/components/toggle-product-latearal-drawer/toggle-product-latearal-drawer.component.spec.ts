import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ToggleProductLatearalDrawerComponent } from './toggle-product-latearal-drawer.component';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

describe('ToggleProductLatearalDrawerComponent', () => {
  let component: ToggleProductLatearalDrawerComponent;
  let fixture: ComponentFixture<ToggleProductLatearalDrawerComponent>;
  let productService: jest.Mocked<ProductService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  const mockProduct: ProductDetail = {
    id: 1,
    name: 'Test Product',
    description: 'Description',
    category: { name: 'Category' },
    price: 100,
    stock: {
      quantityAvailable: 10,
      quantityOrdered: 2,
      quantityReserved: 1,
    },
    weight: 2,
    enabled: true,
    supplier: {
      businessName: 'Supplier',
      email: 'supplier@mail.com',
      phone: '123456789',
    },
  };

  beforeEach(() => {
    productService = {
      getProductById: jest.fn(),
      toggleProductStatus: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    lateralDrawerService = {
      close: jest.fn(),
      updateConfig: jest.fn(),
      config: {},
    } as unknown as jest.Mocked<LateralDrawerService>;

    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      imports: [ToggleProductLatearalDrawerComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: LateralDrawerService, useValue: lateralDrawerService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleProductLatearalDrawerComponent);
    component = fixture.componentInstance;
    component.productId = 1;
  });

  it('should create the component', () => {
    // Act & Assert
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    // Arrange
    productService.getProductById.mockReturnValue(of(mockProduct));

    // Act
    component.ngOnInit();

    // Assert
    expect(productService.getProductById).toHaveBeenCalledWith(1);
    expect(component.product()).toEqual(mockProduct);
    expect(component.isLoading()).toBe(false);
  });

  it('should return correct toggleButtonText when product is enabled', () => {
    // Arrange
    component.product.set({ ...mockProduct, enabled: true });

    // Act
    const text = component.toggleButtonText;

    // Assert
    expect(text).toBe('Pausar');
  });

  it('should return correct toggleButtonText when product is disabled', () => {
    // Arrange
    component.product.set({ ...mockProduct, enabled: false });

    // Act
    const text = component.toggleButtonText;

    // Assert
    expect(text).toBe('Reanudar');
  });

  it('should close drawer on closeDrawer()', () => {
    // Act
    component.closeDrawer();

    // Assert
    expect(lateralDrawerService.close).toHaveBeenCalled();
  });

  it('should not toggle state if product is null', () => {
    // Arrange
    component.product.set(null);

    // Act
    component.toggleProductState();

    // Assert
    expect(component.toggleLoading()).toBe(false);
  });
});
