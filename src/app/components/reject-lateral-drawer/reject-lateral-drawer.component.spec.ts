import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { RejectLateralDrawerComponent } from './reject-lateral-drawer.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import {
  RegistrationRequestService,
  RejectRegistrationRequestResponse,
} from '../../services/registration-request.service';

describe('RejectLateralDrawerComponent', () => {
  let component: RejectLateralDrawerComponent;
  let fixture: ComponentFixture<RejectLateralDrawerComponent>;
  let registrationRequestService: RegistrationRequestService;
  let lateralDrawerService: LateralDrawerService;

  const mockData: RegistrationRequestListItem = {
    id: 1,
    user: {
      fullNameOrBusinessName: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      documentType: 'DNI',
      documentNumber: '12345678',
    },
    status: 'Pending',
    requestDate: '2025-03-28T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RejectLateralDrawerComponent, NoopAnimationsModule],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockDeep<RegistrationRequestService>(),
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
      ],
    });

    fixture = TestBed.createComponent(RejectLateralDrawerComponent);
    component = fixture.componentInstance;

    registrationRequestService = TestBed.inject(RegistrationRequestService);
    lateralDrawerService = TestBed.inject(LateralDrawerService);

    component.data = mockData;

    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should initialize form with rejectionReason control', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.contains('rejectionReason')).toBe(true);
    });

    it('should update isFormInvalid when form becomes valid', () => {
      // Arrange
      component.form.setValue({ rejectionReason: 'Valid reason' });

      // Act
      component.form.updateValueAndValidity();

      // Assert
      expect(component.isFormInvalid()).toBe(false);
    });

    it('should update isFormInvalid when form is invalid', () => {
      // Arrange
      component.form.setValue({ rejectionReason: '' });

      // Act
      component.form.updateValueAndValidity();

      // Assert
      expect(component.isFormInvalid()).toBe(true);
    });
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close()', () => {
      // Arrange
      const closeSpy = jest.spyOn(lateralDrawerService, 'close');

      // Act
      component.closeDrawer();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('handleRejectClick', () => {
    beforeEach(() => {
      component.form.setValue({ rejectionReason: 'Motivo válido' });
    });

    it('should set isLoading to true immediately', () => {
      // Arrange
      jest
        .spyOn(registrationRequestService, 'rejectRegistrationRequest')
        .mockReturnValue(of(mockDeep<RejectRegistrationRequestResponse>()));

      // Act
      component.handleRejectClick();

      // Assert
      expect(component.isLoading()).toBe(true);
    });

    it('should call rejectRegistrationRequest with correct arguments', fakeAsync(() => {
      // Arrange
      const rejectSpy = jest
        .spyOn(registrationRequestService, 'rejectRegistrationRequest')
        .mockReturnValue(of(mockDeep<RejectRegistrationRequestResponse>()));

      // Act
      component.handleRejectClick();
      tick();

      // Assert
      expect(rejectSpy).toHaveBeenCalledWith(mockData.id, 'Motivo válido');
    }));
  });
});
