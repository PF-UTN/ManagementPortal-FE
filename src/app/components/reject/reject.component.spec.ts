import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { RejectDrawerComponent } from './reject.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('RejectDrawerComponent', () => {
  let component: RejectDrawerComponent;
  let fixture: ComponentFixture<RejectDrawerComponent>;
  let mockRegistrationRequestService: jest.Mocked<RegistrationRequestService>;

  beforeEach(async () => {
    mockRegistrationRequestService = {
      rejectRegistrationRequest: jest.fn(),
      approveRegistrationRequest: jest.fn(),
      fetchRegistrationRequests: jest.fn(),
    } as Partial<
      jest.Mocked<RegistrationRequestService>
    > as jest.Mocked<RegistrationRequestService>;

    await TestBed.configureTestingModule({
      imports: [
        RejectDrawerComponent,
        MatSidenavModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockRegistrationRequestService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectDrawerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Arrange
    // Act
    const isComponentCreated = component;

    // Assert
    expect(isComponentCreated).toBeTruthy();
  });

  describe('closeDrawer', () => {
    it('should emit the close event', () => {
      // Arrange
      jest.spyOn(component.close, 'emit');

      // Act
      component.closeDrawer();

      // Assert
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    beforeEach(() => {
      // Arrange
      component.data = {
        id: 1,
        user: {
          fullNameOrBusinessName: 'John Doe',
          email: 'johndoe@example.com',
          documentNumber: '12345678',
          documentType: 'DNI',
          phone: '123456789',
        },
        status: 'Pending',
        requestDate: '2025-03-28T00:00:00Z',
      } as RegistrationRequestListItem;
      component.rejectionReason = 'Motivo de prueba';
    });

    it('should call rejectRegistrationRequest and emit rejectRequest on success', fakeAsync(() => {
      // Arrange
      jest.spyOn(component.rejectRequest, 'emit');
      mockRegistrationRequestService.rejectRegistrationRequest.mockReturnValue(
        of(void 0),
      );

      // Act
      component.reject();
      tick();

      // Assert
      expect(
        mockRegistrationRequestService.rejectRegistrationRequest,
      ).toHaveBeenCalledWith(1, 'Motivo de prueba');
      expect(component.rejectRequest.emit).toHaveBeenCalled();
    }));

    it('should handle errors when rejectRegistrationRequest fails', fakeAsync(() => {
      // Arrange
      mockRegistrationRequestService.rejectRegistrationRequest.mockReturnValue(
        throwError(() => new Error('Error al rechazar')),
      );

      // Act
      component.reject();
      tick();

      // Assert
      expect(
        mockRegistrationRequestService.rejectRegistrationRequest,
      ).toHaveBeenCalledWith(1, 'Motivo de prueba');
    }));
  });
});
