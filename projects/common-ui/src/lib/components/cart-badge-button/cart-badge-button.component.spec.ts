import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartBadgeButtonComponent } from './cart-badge-button.component';

describe('CartBadgeButtonComponent', () => {
  let component: CartBadgeButtonComponent;
  let fixture: ComponentFixture<CartBadgeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartBadgeButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartBadgeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
