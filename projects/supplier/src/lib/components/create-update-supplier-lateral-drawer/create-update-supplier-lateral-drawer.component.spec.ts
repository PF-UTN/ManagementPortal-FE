import {
  mockSupplier,
  mockSupplierCreateUpdateResponse,
  mockSupplierWithTown,
  mockTown,
  TownService,
} from '@Common';
import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CreateUpdateSupplierLateralDrawerComponent } from './create-update-supplier-lateral-drawer.component';
import { SupplierService } from '../../services/supplier.service';

describe('CreateEditSupplierLateralDrawerComponent', () => {
  let component: CreateUpdateSupplierLateralDrawerComponent;
  let fixture: ComponentFixture<CreateUpdateSupplierLateralDrawerComponent>;
  let supplierService: SupplierService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateUpdateSupplierLateralDrawerComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: SupplierService, useValue: mockDeep<SupplierService>() },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: TownService, useValue: mockDeep<TownService> },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(
      CreateUpdateSupplierLateralDrawerComponent,
    );
    component = fixture.componentInstance;
    supplierService = TestBed.inject(SupplierService);
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form as invalid', () => {
    // Arrange
    // Act
    // Assert
    expect(component.supplierForm.valid).toBeFalsy();
  });
  it('should not submit if form is invalid', () => {
    //Arrange
    component.supplierForm.controls.businessName.setValue(null);

    //Act
    component.onSubmit();

    //Assert
    expect(
      supplierService.postCreateOrUpdateSupplierAsync,
    ).not.toHaveBeenCalled();
  });
  it('should mark form as touched', () => {
    //Arrange
    jest.spyOn(component.supplierForm, 'markAllAsTouched');

    //Act
    component.onSubmit();

    //Assert
    expect(component.supplierForm.markAllAsTouched).toHaveBeenCalled();
  });
  it('should call supplierService.postCreateOrUpdateSupplierAsync and close drawer on success', () => {
    //Arrange
    const SupplierData = mockSupplier;
    component.supplierForm.setValue({
      businessName: SupplierData.businessName,
      documentType: SupplierData.documentType,
      documentNumber: SupplierData.documentNumber,
      email: SupplierData.email,
      phone: SupplierData.phone,
      street: SupplierData.address.street,
      streetNumber: SupplierData.address.streetNumber,
      town: mockTown,
    });
    jest
      .spyOn(supplierService, 'postCreateOrUpdateSupplierAsync')
      .mockReturnValue(of(mockSupplierCreateUpdateResponse));
    const closeSpy = jest.spyOn(component, 'closeDrawer');
    const emitSuccessSpy = jest.spyOn(component, 'emitSuccess');

    //Act
    component.onSubmit();

    //Assert
    expect(
      supplierService.postCreateOrUpdateSupplierAsync,
    ).toHaveBeenCalledWith(SupplierData);
    expect(closeSpy).toHaveBeenCalled();
    expect(emitSuccessSpy).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
  });
  it('should emit successEvent after successful submit', fakeAsync(() => {
    //Arrange
    jest
      .spyOn(supplierService, 'getSupplierByDocumentAsync')
      .mockReturnValue(of(mockSupplierWithTown));

    jest
      .spyOn(supplierService, 'postCreateOrUpdateSupplierAsync')
      .mockReturnValue(of(mockSupplierCreateUpdateResponse));

    fixture.detectChanges();

    const emitSpy = jest.spyOn(component.successEvent, 'emit');

    component.isCreating.set(true);

    component.supplierForm.controls.documentType.setValue(
      mockSupplier.documentType,
    );
    component.supplierForm.controls.documentNumber.setValue(
      mockSupplier.documentNumber,
    );
    component.supplierForm.controls.email.setValue(mockSupplier.email);
    component.supplierForm.controls.businessName.setValue(
      mockSupplier.businessName,
    );
    component.supplierForm.controls.phone.setValue(mockSupplier.phone);
    component.supplierForm.controls.street.setValue(
      mockSupplier.address.street,
    );
    component.supplierForm.controls.streetNumber.setValue(
      mockSupplier.address.streetNumber,
    );
    component.supplierForm.controls.town.setValue(
      mockSupplierWithTown.address.town,
    );

    //Act
    component.onSubmit();
    tick();

    //Assert
    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should call getSupplierByDocumentAsync and patch form values when supplier exists', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue(
      mockSupplierWithTown.documentType,
    );
    component.supplierForm.controls.documentNumber.setValue(
      mockSupplierWithTown.documentNumber,
    );
    const patchSpy = jest.spyOn(component.supplierForm, 'patchValue');
    jest
      .spyOn(supplierService, 'getSupplierByDocumentAsync')
      .mockReturnValue(of(mockSupplierWithTown));

    //Act
    component.checkSupplierExists();

    //Assert
    expect(supplierService.getSupplierByDocumentAsync).toHaveBeenCalledWith(
      mockSupplier.documentType,
      mockSupplier.documentNumber,
    );
    expect(patchSpy).toHaveBeenCalledWith({
      businessName: mockSupplierWithTown.businessName,
      email: mockSupplierWithTown.email,
      phone: mockSupplierWithTown.phone,
      street: mockSupplierWithTown.address.street,
      streetNumber: mockSupplierWithTown.address.streetNumber,
      town: mockSupplierWithTown.address.town,
    });
  });
  it('should reset documentNumber when documentType changes', () => {
    //Arrange
    const resetSpy = jest.spyOn(
      component.supplierForm.controls.documentNumber,
      'setValue',
    );
    component.supplierForm.controls.documentType.setValue('CUIT');

    //Assert
    expect(resetSpy).toHaveBeenCalled();
    expect(component.supplierForm.controls.documentNumber.value).toBe(null);
  });
  it('should not call getSupplierByDocument when documentNumber have not enough characters (CUIT)', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue('CUIT');
    component.supplierForm.controls.documentNumber.setValue('123456');

    // Act
    component.checkSupplierExists();

    // Assert
    expect(supplierService.getSupplierByDocumentAsync).not.toHaveBeenCalled();
  });
  it('should not call getSupplierByDocument when documentNumber have not enough characters (CUIL)', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue('CUIL');
    component.supplierForm.controls.documentNumber.setValue('123456');

    // Act
    component.checkSupplierExists();

    // Assert
    expect(supplierService.getSupplierByDocumentAsync).not.toHaveBeenCalled();
  });
  it('should not call getSupplierByDocument when documentNumber have not enough characters (DNI)', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue('DNI');
    component.supplierForm.controls.documentNumber.setValue('1236');

    // Act
    component.checkSupplierExists();

    // Assert
    expect(supplierService.getSupplierByDocumentAsync).not.toHaveBeenCalled();
  });
  it('should update maxDocumentLength and validators when documentType changes', () => {
    //Arrange
    component.supplierForm.controls.documentType.setValue('CUIT');

    //Assert
    expect(component.maxDocumentLength).toBe(11);

    //Arrange
    component.supplierForm.controls.documentType.setValue('DNI');

    //Assert
    expect(component.maxDocumentLength).toBe(8);

    //Arrange
    component.supplierForm.controls.documentType.setValue('');

    //Assert
    expect(component.maxDocumentLength).toBeNull();
  });

  it('should prevent non-numeric input', () => {
    //Arrange
    const event = {
      key: 'b',
      preventDefault: jest.fn(),
      ctrlKey: false,
    } as Partial<KeyboardEvent> as KeyboardEvent;

    //Act
    component.preventNonNumericInput(event as KeyboardEvent);
  });

  it('should not prevent non-numeric input', () => {
    //Arrange
    const event2 = {
      key: '1',
      preventDefault: jest.fn(),
      ctrlKey: false,
    } as Partial<KeyboardEvent> as KeyboardEvent;

    //Act
    component.preventNonNumericInput(event2 as KeyboardEvent);

    //Assert
    expect(event2.preventDefault).not.toHaveBeenCalled();
  });

  it('should display town correctly', () => {
    //Assert
    expect(component.displayTown(null)).toBe('');
    expect(component.displayTown(mockTown)).toBe('Ciudad Ficticia (12345)');
  });
  it('should set isUpdating to true and isCreating to false when supplier exists', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue(
      mockSupplierWithTown.documentType,
    );
    component.supplierForm.controls.documentNumber.setValue(
      mockSupplierWithTown.documentNumber,
    );
    jest
      .spyOn(supplierService, 'getSupplierByDocumentAsync')
      .mockReturnValue(of(mockSupplierWithTown));

    // Act
    component.checkSupplierExists();

    // Assert
    expect(component.isUpdating()).toBe(true);
    expect(component.isCreating()).toBe(false);
  });

  it('should set isDocumentCompleted to true when supplier exists', () => {
    // Arrange
    component.supplierForm.controls.documentType.setValue(
      mockSupplierWithTown.documentType,
    );
    component.supplierForm.controls.documentNumber.setValue(
      mockSupplierWithTown.documentNumber,
    );
    jest
      .spyOn(supplierService, 'getSupplierByDocumentAsync')
      .mockReturnValue(of(mockSupplierWithTown));

    // Act
    component.checkSupplierExists();

    // Assert
    expect(component.isDocumentCompleted()).toBe(true);
  });
});
