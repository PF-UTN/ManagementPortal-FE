import { ProductDetail, ProductService } from '@Product';

import { TestBed } from '@angular/core/testing';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { DetailLateralCartDrawerComponent } from './detail-lateral-cart-drawer.component';

describe('DetailLateralCartDrawerComponent', () => {
  let component: DetailLateralCartDrawerComponent;
  let productServiceMock: MockProxy<ProductService>;

  const mockProduct: ProductDetail = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    weight: 2,
    stock: {
      quantityAvailable: 5,
      quantityOrdered: 0,
      quantityReserved: 0,
    },
    category: {
      name: 'Test Category',
    },
    supplier: {
      businessName: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '123456789',
    },
    enabled: true,
    imageUrl: null,
  };

  beforeEach(async () => {
    productServiceMock = mockDeep<ProductService>();

    await TestBed.configureTestingModule({
      imports: [DetailLateralCartDrawerComponent],
      providers: [
        {
          provide: ProductService,
          useValue: productServiceMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailLateralCartDrawerComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    test('should fetch product and set data', () => {
      // Arrange
      component.productId = 1;
      productServiceMock.getProductById.mockReturnValue(of(mockProduct));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.data()).toEqual(mockProduct);
      expect(component.isLoading()).toBe(false);
    });

    test('should set error if product fetch fails', () => {
      // Arrange
      component.productId = 1;
      productServiceMock.getProductById.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(component.error()).toBe(
        'No se pudo obtener el detalle del producto.',
      );
      expect(component.isLoading()).toBe(false);
    });
  });
});
