import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailVehicleDrawerComponent } from './detail-vehicle-drawer.component';
import { VehicleListItem } from '../../models/vehicle-item.model';

describe('DetailVehicleDrawerComponent', () => {
  let component: DetailVehicleDrawerComponent;
  let fixture: ComponentFixture<DetailVehicleDrawerComponent>;

  const mockVehicle: VehicleListItem = {
    id: 1,
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    kmTraveled: 10000,
    admissionDate: '2025-07-31T00:00:00.000Z',
    enabled: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailVehicleDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailVehicleDrawerComponent);
    component = fixture.componentInstance;
    component.data = mockVehicle;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
