import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { DetailLateralDrawerComponent } from './detail-lateral-drawer.component';
import { ProductService } from '../../services/product.service';
import {
  mockProductDetail,
  mockProductListItem,
} from '../../testing/mock-data.model';

describe('DetailLateralDrawerComponent', () => {
  let component: DetailLateralDrawerComponent;
  let fixture: ComponentFixture<DetailLateralDrawerComponent>;
  let lateralDrawerService: LateralDrawerService;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLateralDrawerComponent],
      providers: [
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailLateralDrawerComponent);
    component = fixture.componentInstance;

    lateralDrawerService = TestBed.inject(LateralDrawerService);
    productService = TestBed.inject(ProductService);

    component.productId = mockProductListItem.id;

    jest
      .spyOn(productService, 'getProductById')
      .mockReturnValue(of(mockProductDetail));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call productService.getProductById with the correct productId on ngOnInit', () => {
    expect(productService.getProductById).toHaveBeenCalledWith(
      mockProductListItem.id,
    );
  });

  it('should set the product detail data after loading', () => {
    expect(component.data()).toEqual(mockProductDetail);
  });

  it('should set isLoading to false after product detail is loaded', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should call lateralDrawerService.updateConfig during construction', () => {
    expect(lateralDrawerService.updateConfig).toHaveBeenCalled();
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close()', () => {
      // Act
      component.closeDrawer();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });
  });
});
