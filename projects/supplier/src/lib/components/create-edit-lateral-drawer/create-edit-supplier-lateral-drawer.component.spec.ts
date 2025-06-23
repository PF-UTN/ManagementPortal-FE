import {
  mockSupplier,
  mockSupplierCreateUpdateResponse,
  mockTown,
  TownService,
} from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CreateEditSupplierLateralDrawerComponent } from './create-edit-supplier-lateral-drawer.component';
import { SupplierService } from '../../services/supplier.service';

describe('CreateEditSupplierLateralDrawerComponent', () => {
  let component: CreateEditSupplierLateralDrawerComponent;
  let fixture: ComponentFixture<CreateEditSupplierLateralDrawerComponent>;
  let supplierService: SupplierService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditSupplierLateralDrawerComponent, NoopAnimationsModule],
      providers: [
        { provide: SupplierService, useValue: mockDeep<SupplierService>() },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: TownService, useValue: mockDeep<TownService> },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CreateEditSupplierLateralDrawerComponent);
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
  it('should reset documentNumber when documentType changes', () => {
    //Arrange
    const resetSpy = jest.spyOn(
      component.supplierForm.controls.documentNumber,
      'reset',
    );
    component.supplierForm.controls.documentType.setValue('CUIT');

    //Assert
    expect(resetSpy).toHaveBeenCalled();
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
});
