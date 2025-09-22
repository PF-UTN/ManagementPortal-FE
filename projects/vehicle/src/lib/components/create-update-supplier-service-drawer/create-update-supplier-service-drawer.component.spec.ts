import { TownService, Town } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CreateUpdateSupplierServiceDrawerComponent } from './create-update-supplier-service-drawer.component';
import { VehicleService } from '../../services/vehicle.service';

describe('CreateUpdateSupplierServiceDrawerComponent', () => {
  let component: CreateUpdateSupplierServiceDrawerComponent;
  let fixture: ComponentFixture<CreateUpdateSupplierServiceDrawerComponent>;
  let vehicleService: VehicleService;

  const mockTown: Town = {
    id: 1,
    name: 'Ciudad Ficticia',
    zipCode: '12345',
  } as Town;
  const mockSupplier = {
    businessName: 'Proveedor Test',
    documentType: 'CUIT',
    documentNumber: '20123456789',
    email: 'test@proveedor.com',
    phone: '123456789',
    address: {
      street: 'Calle Falsa',
      streetNumber: 123,
      town: mockTown,
      townId: 1,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateUpdateSupplierServiceDrawerComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: VehicleService, useValue: mockDeep<VehicleService>() },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: TownService, useValue: mockDeep<TownService>() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateUpdateSupplierServiceDrawerComponent,
    );
    component = fixture.componentInstance;
    vehicleService = TestBed.inject(VehicleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should not submit if form is invalid', () => {
    jest.spyOn(vehicleService, 'createServiceSupplier');
    component.form.controls.businessName.setValue(null);
    component.onSubmit();
    expect(vehicleService.createServiceSupplier).not.toHaveBeenCalled();
  });

  it('should enable supplier fields', () => {
    component.enableSupplierFields();
    expect(component.form.controls.businessName.enabled).toBe(true);
    expect(component.form.controls.email.enabled).toBe(true);
    expect(component.form.controls.phone.enabled).toBe(true);
    expect(component.form.controls.street.enabled).toBe(true);
    expect(component.form.controls.streetNumber.enabled).toBe(true);
    expect(component.form.controls.town.enabled).toBe(true);
  });

  it('should patch form and set isUpdating when supplier exists', fakeAsync(() => {
    const supplierWithTown = {
      id: 99,
      addressId: 123,
      ...mockSupplier,
      address: {
        id: 456, // <-- agregado
        ...mockSupplier.address,
        town: mockTown,
      },
    };
    jest
      .spyOn(vehicleService, 'getServiceSupplierByDocument')
      .mockReturnValue(of(supplierWithTown));
    component.form.controls.documentType.enable();
    component.form.controls.documentNumber.enable();
    component.form.controls.documentType.setValue('CUIT');
    component.form.controls.documentNumber.setValue('20123456789');
    component.tryFetchSupplier();
    tick();

    expect(component.isUpdating()).toBe(true);
    expect(component.form.controls.businessName.value).toBe(
      supplierWithTown.businessName,
    );
    expect(component.form.controls.email.value).toBe(supplierWithTown.email);
    expect(component.form.controls.town.value).toEqual(mockTown);
    expect(component.form.controls.documentType.disabled).toBe(true);
    expect(component.form.controls.documentNumber.disabled).toBe(true);
    expect(component.isLoading()).toBe(false);
  }));

  it('should clear fields and set isUpdating false if supplier does not exist', fakeAsync(() => {
    jest
      .spyOn(vehicleService, 'getServiceSupplierByDocument')
      .mockReturnValue(of(null));
    component.form.controls.documentType.enable();
    component.form.controls.documentNumber.enable();
    component.form.controls.documentType.setValue('CUIT');
    component.form.controls.documentNumber.setValue('20123456789');
    component.tryFetchSupplier();
    tick();

    expect(component.isUpdating()).toBe(false);
    expect(component.form.controls.businessName.value).toBeNull();
    expect(component.form.controls.email.value).toBeNull();
    expect(component.form.controls.town.value).toBeNull();
    expect(component.isLoading()).toBe(false);
  }));

  it('should not fetch supplier if documentType or documentNumber is missing', () => {
    jest.spyOn(vehicleService, 'getServiceSupplierByDocument');
    component.form.controls.documentType.setValue(null);
    component.form.controls.documentNumber.setValue('123');
    component.tryFetchSupplier();
    expect(vehicleService.getServiceSupplierByDocument).not.toHaveBeenCalled();
  });

  it('should not fetch supplier if documentNumber is too short', () => {
    jest.spyOn(vehicleService, 'getServiceSupplierByDocument');
    component.form.controls.documentType.setValue('DNI');
    component.form.controls.documentNumber.setValue('1234');
    component.tryFetchSupplier();
    expect(vehicleService.getServiceSupplierByDocument).not.toHaveBeenCalled();
  });

  it('should display town correctly', () => {
    expect(component.displayTown(null)).toBe('');
    expect(component.displayTown('string')).toBe('string');
    expect(component.displayTown(mockTown)).toBe('Ciudad Ficticia (12345)');
  });

  it('should close drawer', () => {
    const closeSpy = jest.spyOn(TestBed.inject(LateralDrawerService), 'close');
    component.closeDrawer();
    expect(closeSpy).toHaveBeenCalled();
  });
});
