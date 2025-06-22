import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditLateralDrawerComponent } from './create-edit-supplier-lateral-drawer.component';

describe('CreateEditLateralDrawerComponent', () => {
  let component: CreateEditLateralDrawerComponent;
  let fixture: ComponentFixture<CreateEditLateralDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditLateralDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditLateralDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
