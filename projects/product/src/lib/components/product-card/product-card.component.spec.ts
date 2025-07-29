import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = {
      id: 1,
      stock: 5,
      name: 'Test',
      price: 100,
      weight: 2,
      description: '',
      categoryName: '',
      supplierBusinessName: '',
      enabled: true,
    };
    component.initialQuantity = 2;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      // Assert
      expect(component).toBeTruthy();
    });

    it('should initialize quantity with initialQuantity', () => {
      // Assert
      expect(component.quantity).toBe(2);
    });
  });

  describe('Drawer', () => {
    it('should emit openDrawer with productId and quantity when openProductDrawer is called', () => {
      // Arrange
      const spy = jest.spyOn(component.openDrawer, 'emit');
      component.quantity = 3;
      // Act
      component.openProductDrawer();
      // Assert
      expect(spy).toHaveBeenCalledWith({ productId: 1, quantity: 3 });
    });

    it('should emit openDrawer with productId and quantity on Enter keydown', () => {
      // Arrange
      const spy = jest.spyOn(component.openDrawer, 'emit');
      component.quantity = 4;
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      // Act
      component.onCardKeyDown(event);
      // Assert
      expect(spy).toHaveBeenCalledWith({ productId: 1, quantity: 4 });
    });
  });

  describe('Quantity', () => {
    it('should update quantity when onQuantityChange is called', () => {
      // Act
      component.onQuantityChange(4);
      // Assert
      expect(component.quantity).toBe(4);
    });

    it('should clamp quantity to stock when input is greater than stock', () => {
      // Arrange
      const input = document.createElement('input');
      Object.defineProperty(input, 'valueAsNumber', {
        value: 10,
        configurable: true,
      });
      input.value = '10';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: input });

      // Act
      component.onQuantityInput(event);

      // Assert
      expect(component.quantity).toBe(5); // stock is 5
    });

    it('should clamp quantity to 1 when input is less than 1', () => {
      // Arrange
      const input = document.createElement('input');
      Object.defineProperty(input, 'valueAsNumber', {
        value: 0,
        configurable: true,
      });
      input.value = '0';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: input });

      // Act
      component.onQuantityInput(event);

      // Assert
      expect(component.quantity).toBe(1);
    });
  });

  describe('Add to cart', () => {
    it('should emit addToCart when onAddToCartKeyDown is called', () => {
      // Arrange
      const spy = jest.spyOn(component.addToCart, 'emit');
      // Act
      component.onAddToCartKeyDown();
      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });
});
