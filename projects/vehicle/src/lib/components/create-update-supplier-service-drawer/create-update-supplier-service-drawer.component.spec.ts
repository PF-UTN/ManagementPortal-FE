import { TownService, Town, VehicleService } from '@Common';
import { LateralDrawerService, LateralDrawerConfig } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { CreateUpdateSupplierServiceDrawerComponent } from './create-update-supplier-service-drawer.component';

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

  describe('Initialization', () => {
    it('should create', () => {
      // Arrange

      // Act

      // Assert
      expect(component).toBeTruthy();
    });

    it('should initialize form as invalid', () => {
      // Arrange

      // Act

      // Assert
      expect(component.form.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should not submit if form is invalid', () => {
      // Arrange
      jest.spyOn(vehicleService, 'createServiceSupplier');
      component.form.controls.businessName.setValue(null);

      // Act
      component.onSubmit();

      // Assert
      expect(vehicleService.createServiceSupplier).not.toHaveBeenCalled();
    });

    it('should enable supplier fields', () => {
      // Arrange

      // Act
      component.enableSupplierFields();

      // Assert
      expect(component.form.controls.businessName.enabled).toBe(true);
      expect(component.form.controls.email.enabled).toBe(true);
      expect(component.form.controls.phone.enabled).toBe(true);
      expect(component.form.controls.street.enabled).toBe(true);
      expect(component.form.controls.streetNumber.enabled).toBe(true);
      expect(component.form.controls.town.enabled).toBe(true);
    });
  });

  describe('Supplier Fetching', () => {
    it('should patch form and set isUpdating when supplier exists', fakeAsync(() => {
      // Arrange
      const supplierWithTown = {
        id: 99,
        addressId: 123,
        ...mockSupplier,
        address: {
          id: 456,
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

      // Act
      component.tryFetchSupplier();
      tick();

      // Assert
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
      // Arrange
      jest
        .spyOn(vehicleService, 'getServiceSupplierByDocument')
        .mockReturnValue(of(null));
      component.form.controls.documentType.enable();
      component.form.controls.documentNumber.enable();
      component.form.controls.documentType.setValue('CUIT');
      component.form.controls.documentNumber.setValue('20123456789');

      // Act
      component.tryFetchSupplier();
      tick();

      // Assert
      expect(component.isUpdating()).toBe(false);
      expect(component.form.controls.businessName.value).toBeNull();
      expect(component.form.controls.email.value).toBeNull();
      expect(component.form.controls.town.value).toBeNull();
      expect(component.isLoading()).toBe(false);
    }));

    it('should not fetch supplier if documentType or documentNumber is missing', () => {
      // Arrange
      jest.spyOn(vehicleService, 'getServiceSupplierByDocument');
      component.form.controls.documentType.setValue(null);
      component.form.controls.documentNumber.setValue('123');

      // Act
      component.tryFetchSupplier();

      // Assert
      expect(
        vehicleService.getServiceSupplierByDocument,
      ).not.toHaveBeenCalled();
    });

    it('should not fetch supplier if documentNumber is too short', () => {
      // Arrange
      jest.spyOn(vehicleService, 'getServiceSupplierByDocument');
      component.form.controls.documentType.setValue('DNI');
      component.form.controls.documentNumber.setValue('1234');

      // Act
      component.tryFetchSupplier();

      // Assert
      expect(
        vehicleService.getServiceSupplierByDocument,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Display', () => {
    it('should display town correctly', () => {
      // Arrange

      // Act

      // Assert
      expect(component.displayTown(null)).toBe('');
      expect(component.displayTown('string')).toBe('string');
      expect(component.displayTown(mockTown)).toBe('Ciudad Ficticia (12345)');
    });
  });

  describe('Drawer Actions', () => {
    it('should close drawer', () => {
      // Arrange
      const closeSpy = jest.spyOn(
        TestBed.inject(LateralDrawerService),
        'close',
      );

      // Act
      component.closeDrawer();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call onSubmit when the drawer primary button is clicked', () => {
      // Arrange
      const onSubmitSpy = jest.spyOn(component, 'onSubmit');
      const lateralDrawerService = TestBed.inject(LateralDrawerService);
      let capturedConfig: LateralDrawerConfig | undefined;
      (lateralDrawerService.updateConfig as jest.Mock).mockImplementation(
        (config: LateralDrawerConfig) => {
          capturedConfig = config;
        },
      );
      component['isFormValid'].set(true);
      component['isUpdating'].set(false);
      fixture.detectChanges();

      // Act
      capturedConfig!.footer.firstButton.click();

      // Assert
      expect(onSubmitSpy).toHaveBeenCalled();
    });

    it('should call closeDrawer when the drawer cancel button is clicked', () => {
      // Arrange
      const closeDrawerSpy = jest.spyOn(component, 'closeDrawer');
      const lateralDrawerService = TestBed.inject(LateralDrawerService);
      let capturedConfig: LateralDrawerConfig | undefined;
      (lateralDrawerService.updateConfig as jest.Mock).mockImplementation(
        (config: LateralDrawerConfig) => {
          capturedConfig = config;
        },
      );
      component['isFormValid'].set(true);
      component['isUpdating'].set(false);
      fixture.detectChanges();

      // Act
      capturedConfig!.footer.secondButton!.click();

      // Assert
      expect(closeDrawerSpy).toHaveBeenCalled();
    });
  });

  describe('Autocomplete', () => {
    it('should emit the results array from the townService.searchTowns response', fakeAsync(() => {
      // Arrange
      const townService = TestBed.inject(TownService);
      const mockResults: Town[] = [
        { id: 1, name: 'Rosario', zipCode: '2000', provinceId: 1 },
        { id: 2, name: 'Córdoba', zipCode: '5000', provinceId: 2 },
      ];
      (townService.searchTowns as jest.Mock).mockReturnValue(
        of({ results: mockResults }),
      );
      let emitted: Town[] | undefined;

      // Act
      component.form.controls.town.setValue('Rosario' as unknown as Town);
      tick(300);
      component.filteredTowns$.subscribe((towns) => {
        emitted = towns;
      });
      tick();

      // Assert
      expect(emitted).toEqual(mockResults);
    }));
  });

  describe('Submit', () => {
    it('should call createServiceSupplier with correct data when form is valid', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      const createSpy = jest
        .spyOn(vehicleService, 'createServiceSupplier')
        .mockReturnValue(
          of({
            id: 1,
            businessName: 'Proveedor Test',
            documentType: 'CUIT',
            documentNumber: '20123456789',
            email: 'test@proveedor.com',
            phone: '123456789',
            addressId: 99,
            address: {
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          }),
        );
      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
          townId: 1,
        },
      });
    });

    it('should not submit if form is invalid', () => {
      // Arrange
      jest.spyOn(vehicleService, 'createServiceSupplier');
      component.form.controls.businessName.setValue(null);

      // Act
      component.onSubmit();

      // Assert
      expect(vehicleService.createServiceSupplier).not.toHaveBeenCalled();
    });

    it('should call createServiceSupplier with correct data when form is valid', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      const createSpy = jest
        .spyOn(vehicleService, 'createServiceSupplier')
        .mockReturnValue(
          of({
            id: 1,
            businessName: 'Proveedor Test',
            documentType: 'CUIT',
            documentNumber: '20123456789',
            email: 'test@proveedor.com',
            phone: '123456789',
            addressId: 99,
            address: {
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          }),
        );
      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
          townId: 1,
        },
      });
    });

    it('should emit success and close drawer on successful supplier creation', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.spyOn(vehicleService, 'createServiceSupplier').mockReturnValue(
        of({
          id: 1,
          businessName: 'Proveedor Test',
          documentType: 'CUIT',
          documentNumber: '20123456789',
          email: 'test@proveedor.com',
          phone: '123456789',
          addressId: 99,
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
            townId: 1,
          },
        }),
      );
      const emitSuccessSpy = jest.spyOn(component, 'emitSuccess');
      const closeDrawerSpy = jest.spyOn(component, 'closeDrawer');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(emitSuccessSpy).toHaveBeenCalled();
      expect(closeDrawerSpy).toHaveBeenCalled();
    });

    it('should emit success and close drawer on successful supplier creation', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.spyOn(vehicleService, 'createServiceSupplier').mockReturnValue(
        of({
          id: 1,
          businessName: 'Proveedor Test',
          documentType: 'CUIT',
          documentNumber: '20123456789',
          email: 'test@proveedor.com',
          phone: '123456789',
          addressId: 99,
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
            townId: 1,
          },
        }),
      );
      const emitSuccessSpy = jest.spyOn(component, 'emitSuccess');
      const closeDrawerSpy = jest.spyOn(component, 'closeDrawer');
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(emitSuccessSpy).toHaveBeenCalled();
      expect(closeDrawerSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Proveedor creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('Error Handling', () => {
    it('should set documentExists error and show snackbar if service returns 409', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'createServiceSupplier')
        .mockReturnValue(throwError(() => ({ status: 409 })));
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.form.controls.documentNumber.errors).toEqual({
        documentExists: true,
      });
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Este documento ya se encuentra registrado.',
        'Cerrar',
        { duration: 4000 },
      );
      expect(component.isLoading()).toBe(false);
    });

    it('should set documentExists error and show snackbar if service returns 409', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'createServiceSupplier')
        .mockReturnValue(throwError(() => ({ status: 409 })));
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.form.controls.documentNumber.errors).toEqual({
        documentExists: true,
      });
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Este documento ya se encuentra registrado.',
        'Cerrar',
        { duration: 4000 },
      );
    });

    it('should show snackbar with joined messages if service returns 400 and error.message is array', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.spyOn(vehicleService, 'createServiceSupplier').mockReturnValue(
        throwError(() => ({
          status: 400,
          error: { message: ['Campo A es requerido', 'Campo B inválido'] },
        })),
      );
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Campo A es requerido\nCampo B inválido',
        'Cerrar',
        { duration: 5000 },
      );
    });

    it('should show generic error snackbar if service returns unknown error', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.spyOn(vehicleService, 'createServiceSupplier').mockReturnValue(
        throwError(() => ({
          status: 500,
          error: { message: 'Error inesperado' },
        })),
      );
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');

      component.enableSupplierFields();
      component.form.setValue({
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20123456789',
        email: 'test@proveedor.com',
        phone: '123456789',
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          id: 1,
          name: 'Ciudad Ficticia',
          zipCode: '12345',
          provinceId: 1,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Ocurrió un error al guardar el proveedor',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });
});
