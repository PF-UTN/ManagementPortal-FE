import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProductCategoryLateralDrawerComponent } from './create-update-product-category-lateral-drawer.component';

describe('CreateUpdateProductCategoryLateralDrawerComponent', () => {
  let component: CreateUpdateProductCategoryLateralDrawerComponent;
  let fixture: ComponentFixture<CreateUpdateProductCategoryLateralDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProductCategoryLateralDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateUpdateProductCategoryLateralDrawerComponent,
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
