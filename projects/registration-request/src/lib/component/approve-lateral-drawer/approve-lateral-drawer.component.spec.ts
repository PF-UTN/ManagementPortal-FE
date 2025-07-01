import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ApproveLateralDrawerComponent } from './approve-lateral-drawer.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('ApproveLateralDrawerComponent', () => {
  let component: ApproveLateralDrawerComponent;
  let fixture: ComponentFixture<ApproveLateralDrawerComponent>;
  let registrationRequestService: RegistrationRequestService;
  let lateralDrawerService: LateralDrawerService;

  const mockData: RegistrationRequestListItem = {
    id: 1,
    user: {
      fullNameOrBusinessName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '987654321',
      documentType: 'DNI',
      documentNumber: '87654321',
      taxCategory: 'Responsible Inscripto',
      address: {
        streetAddress: '123 Main St',
        town: 'Springfield',
        zipCode: '12345',
      },
    },
    status: 'Pending',
    requestDate: '2025-03-28T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApproveLateralDrawerComponent],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockDeep<RegistrationRequestService>(),
        },
        {
          provide: MatSnackBar,
          useValue: { open: jest.fn() },
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    });

    fixture = TestBed.createComponent(ApproveLateralDrawerComponent);
    component = fixture.componentInstance;

    registrationRequestService = TestBed.inject(RegistrationRequestService);
    lateralDrawerService = TestBed.inject(LateralDrawerService);

    component.data = mockData;
    fixture.detectChanges();
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close()', () => {
      // Act
      component.closeDrawer();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });
  });

  describe('handleApproveClick', () => {
    it('should call approveRegistrationRequest with correct params', () => {
      // Arrange
      jest
        .spyOn(registrationRequestService, 'approveRegistrationRequest')
        .mockReturnValue(of());

      // Act
      component.handleApproveClick();

      // Assert
      expect(
        registrationRequestService.approveRegistrationRequest,
      ).toHaveBeenCalledWith(mockData.id, '');
    });

    it('should set isLoading to true at start', () => {
      // Arrange
      jest
        .spyOn(registrationRequestService, 'approveRegistrationRequest')
        .mockReturnValue(of());

      const isLoadingSpy = jest.spyOn(component.isLoading, 'set');

      // Act
      component.handleApproveClick();

      // Assert
      expect(isLoadingSpy.mock.calls[0][0]).toBe(true);
    });
  });
});
