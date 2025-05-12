import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NgModel } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { throwError } from 'rxjs';

import { RejectDrawerComponent } from './reject.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('RejectDrawerComponent', () => {
  let component: RejectDrawerComponent;
  let fixture: ComponentFixture<RejectDrawerComponent>;
  let mockRegistrationRequestService: DeepMockProxy<RegistrationRequestService>;
  let mockSnackBar: MatSnackBar;

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

  beforeEach(async () => {
    mockRegistrationRequestService = mockDeep<RegistrationRequestService>();
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as MatSnackBar;

    await TestBed.configureTestingModule({
      imports: [RejectDrawerComponent, NoopAnimationsModule],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockRegistrationRequestService,
        },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectDrawerComponent);
    component = fixture.componentInstance;

    component.data = mockData;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('closeDrawer', () => {
    it('should emit the close event', () => {
      // Arrange
      const closeSpy = jest.spyOn(component.close, 'emit');

      // Act
      component.closeDrawer();

      // Assert
      expect(component.isDrawerOpen).toBe(false);
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('handleRejectClick', () => {
    beforeEach(() => {
      component.data = mockData;

      component.rejectionReasonInput = {
        invalid: false,
        control: {
          markAsTouched: jest.fn(),
        },
      } as unknown as NgModel;
    });

    it('should not proceed if rejectionReason is invalid', () => {
      // Arrange
      component.rejectionReason = '';
      jest.spyOn(component.rejectionReasonInput.control, 'markAsTouched');

      // Act
      component.handleRejectClick();

      // Assert
      expect(
        component.rejectionReasonInput.control.markAsTouched,
      ).toHaveBeenCalled();
      expect(
        mockRegistrationRequestService.rejectRegistrationRequest,
      ).not.toHaveBeenCalled();
    });

    it('should handle errors when rejectRegistrationRequest fails', fakeAsync(() => {
      // Arrange
      component.rejectionReason = 'Motivo válido';
      mockRegistrationRequestService.rejectRegistrationRequest.mockReturnValue(
        throwError(() => new Error('Error al rechazar')),
      );

      // Act
      component.handleRejectClick();
      tick();

      // Assert
      expect(
        mockRegistrationRequestService.rejectRegistrationRequest,
      ).toHaveBeenCalledWith(1, 'Motivo válido');
      expect(component.isLoading()).toBe(false);
    }));
  });

  describe('handleKeyDown', () => {
    it('should call closeDrawer when Escape key is pressed', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      jest.spyOn(component, 'closeDrawer');

      // Act
      component.handleKeyDown(event);

      // Assert
      expect(component.closeDrawer).toHaveBeenCalled();
    });

    it('should call handleRejectClick when Enter key is pressed', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(component, 'handleRejectClick');

      // Act
      component.handleKeyDown(event);

      // Assert
      expect(component.handleRejectClick).toHaveBeenCalled();
    });

    it('should not call any method for other keys', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      jest.spyOn(component, 'closeDrawer');
      jest.spyOn(component, 'handleRejectClick');

      // Act
      component.handleKeyDown(event);

      // Assert
      expect(component.closeDrawer).not.toHaveBeenCalled();
      expect(component.handleRejectClick).not.toHaveBeenCalled();
    });
  });

  describe('mp-button keydown events', () => {
    it('should call closeDrawer when Escape key is pressed on the Cancel button', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      jest.spyOn(component, 'closeDrawer');
      fixture.detectChanges();

      const cancelButton = fixture.nativeElement.querySelector(
        'mp-button[type="secondary"]',
      );

      // Act
      cancelButton.dispatchEvent(event);

      // Assert
      expect(component.closeDrawer).toHaveBeenCalled();
    });

    it('should call handleRejectClick when Enter key is pressed on the Reject button', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(component, 'handleRejectClick');
      fixture.detectChanges();

      const rejectButton = fixture.nativeElement.querySelector(
        'mp-button[type="secondary"]:last-child',
      );

      // Act
      rejectButton.dispatchEvent(event);

      // Assert
      expect(component.handleRejectClick).toHaveBeenCalled();
    });
  });
});
