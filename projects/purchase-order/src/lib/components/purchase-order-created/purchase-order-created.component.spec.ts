import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderCreatedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
