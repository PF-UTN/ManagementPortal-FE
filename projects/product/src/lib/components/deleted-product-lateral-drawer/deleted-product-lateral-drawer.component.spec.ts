import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
} from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DeletedProductLateralDrawerComponent } from './deleted-product-lateral-drawer.component';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

describe('DeleteLateralDrawerComponent', () => {
  let component: DeletedProductLateralDrawerComponent;
  let fixture: ComponentFixture<DeletedProductLateralDrawerComponent>;
  let productService: jest.Mocked<ProductService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let dialog: jest.Mocked<MatDialog>;

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
    imageUrl: null,
  };

  beforeEach(async () => {
    productService = {
      getProductById: jest.fn(),
      deletedProduct: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    lateralDrawerService = {
      close: jest.fn(),
      updateConfig: jest.fn(),
      config: {},
    } as unknown as jest.Mocked<LateralDrawerService>;

    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    dialog = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [DeletedProductLateralDrawerComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: LateralDrawerService, useValue: lateralDrawerService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletedProductLateralDrawerComponent);
    component = fixture.componentInstance;
    component.productId = 1;
  });

  describe('ngOnInit', () => {
    it('should load product and hide loading', () => {
      // Arrange
      productService.getProductById.mockReturnValue(of(mockProduct));

      // Act
      component.ngOnInit();

      // Assert
      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close()', () => {
      // Act
      component.closeDrawer();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });
  });

  describe('confirmDelete', () => {
    it('should open confirmation modal and call onDelete if confirmed', () => {
      // Arrange
      const afterClosedMock = { afterClosed: () => of(true) };
      (dialog.open as jest.Mock).mockReturnValue(afterClosedMock);
      const onDeleteSpy = jest.spyOn(component, 'onDelete');

      // Act
      component.confirmDelete();

      // Assert
      expect(dialog.open).toHaveBeenCalled();
      expect(onDeleteSpy).toHaveBeenCalled();
    });

    it('should not call onDelete if user cancels', () => {
      // Arrange
      const afterClosedMock = { afterClosed: () => of(false) };
      (dialog.open as jest.Mock).mockReturnValue(afterClosedMock);
      const onDeleteSpy = jest.spyOn(component, 'onDelete');

      // Act
      component.confirmDelete();

      // Assert
      expect(onDeleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      productService.getProductById.mockReturnValue(of(mockProduct));
      component.product = mockProduct;
    });

    it('should call deletedProduct and close drawer on success', fakeAsync(() => {
      // Arrange
      productService.deletedProduct.mockReturnValue(of(void 0));
      const closeSpy = jest.spyOn(component, 'closeDrawer');
      const emitSuccessSpy = jest.spyOn(component, 'emitSuccess');

      // Act
      component.onDelete();
      tick();
      fixture.detectChanges();

      // Assert
      expect(productService.deletedProduct).toHaveBeenCalledWith(
        mockProduct.id,
      );
      expect(closeSpy).toHaveBeenCalled();
      expect(emitSuccessSpy).toHaveBeenCalled();
      expect(component.deleteLoading()).toBe(false);
    }));
  });
});
