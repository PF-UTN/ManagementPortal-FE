import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { MaintenanceHistoryComponent } from './maintenance-history.component';

describe('MaintenanceHistoryComponent', () => {
  let component: MaintenanceHistoryComponent;
  let fixture: ComponentFixture<MaintenanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceHistoryComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'vehicleId' ? '123' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have dropdown items with correct labels', () => {
    // Act
    const labels = component.dropdownItems.map((item) => item.label);
    // Assert
    expect(labels).toContain('Crear Mantenimiento');
    expect(labels).toContain('Crear Reparación');
  });

  it('should call onCreateMaintenanceDrawer when dropdown action is triggered', () => {
    // Arrange
    const spy = jest.spyOn(component, 'onCreateMaintenanceDrawer');
    // Act
    component.dropdownItems[0].action();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should call onCreateRepairDrawer when dropdown action is triggered', () => {
    // Arrange
    const spy = jest.spyOn(component, 'onCreateRepairDrawer');
    // Act
    component.dropdownItems[1].action();
    // Assert
    expect(spy).toHaveBeenCalled();
  });
});
