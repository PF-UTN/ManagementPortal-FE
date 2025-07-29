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
    // Arrange
    component.product = {
      id: 1,
      stock: 1,
      name: '',
      price: 0,
      weight: 0,
      description: '',
      categoryName: '',
      supplierBusinessName: '',
      enabled: true,
    };
    component.quantities = { 1: 1 };
    component.stockError = { 1: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    // Arrange & Act done in beforeEach
    // Assert
    expect(component).toBeTruthy();
  });

  it('should emit openDrawer when openProductDrawer is called', () => {
    // Arrange
    const spy = jest.spyOn(component.openDrawer, 'emit');
    const productId = 1;
    // Act
    component.openProductDrawer(productId);
    // Assert
    expect(spy).toHaveBeenCalledWith(productId);
  });

  it('should emit increase when increaseQuantity is called', () => {
    // Arrange
    const spy = jest.spyOn(component.increase, 'emit');
    const productId = 1;
    // Act
    component.increaseQuantity(productId);
    // Assert
    expect(spy).toHaveBeenCalledWith(productId);
  });

  it('should emit decrease when decreaseQuantity is called', () => {
    // Arrange
    const spy = jest.spyOn(component.decrease, 'emit');
    const productId = 1;
    // Act
    component.decreaseQuantity(productId);
    // Assert
    expect(spy).toHaveBeenCalledWith(productId);
  });

  it('should emit quantityInput when onQuantityInput is called', () => {
    // Arrange
    const spy = jest.spyOn(component.quantityInput, 'emit');
    const productId = 1;
    const event = new Event('input');
    // Act
    component.onQuantityInput(productId, event);
    // Assert
    expect(spy).toHaveBeenCalledWith({ productId, event });
  });

  it('should emit addToCart when onAddToCartKeyDown is called', () => {
    // Arrange
    const spy = jest.spyOn(component.addToCart, 'emit');
    // Act
    component.onAddToCartKeyDown();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should emit openDrawer on Enter keydown', () => {
    // Arrange
    const spy = jest.spyOn(component.openDrawer, 'emit');
    component.product = {
      id: 5,
      stock: 1,
      name: '',
      price: 0,
      weight: 0,
      description: '',
      categoryName: '',
      supplierBusinessName: '',
      enabled: true,
    };
    component.quantities = { 5: 1 };
    component.stockError = { 5: false };
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    // Act
    component.onCardKeyDown(event);
    // Assert
    // Assert
    expect(spy).toHaveBeenCalledWith(5);
  });
});
