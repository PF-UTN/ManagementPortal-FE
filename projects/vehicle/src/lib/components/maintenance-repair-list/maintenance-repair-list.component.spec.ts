import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceRepairListComponent } from './maintenance-repair-list.component';

describe('MaintenanceRepairListComponent', () => {
  let component: MaintenanceRepairListComponent;
  let fixture: ComponentFixture<MaintenanceRepairListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceRepairListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceRepairListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
