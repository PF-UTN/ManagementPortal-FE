import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMaintenancePlanComponent } from './create-maintenance-plan.component';

describe('CreateMaintenancePlanComponent', () => {
  let component: CreateMaintenancePlanComponent;
  let fixture: ComponentFixture<CreateMaintenancePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMaintenancePlanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMaintenancePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
