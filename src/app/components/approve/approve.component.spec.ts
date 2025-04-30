import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { ApproveDrawerComponent } from './approve.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('ApproveDrawerComponent', () => {
  let component: ApproveDrawerComponent;
  let fixture: ComponentFixture<ApproveDrawerComponent>;
  let mockRegistrationRequestService: DeepMockProxy<RegistrationRequestService>;

  beforeEach(async () => {
    mockRegistrationRequestService = mockDeep<RegistrationRequestService>();

    await TestBed.configureTestingModule({
      imports: [
        ApproveDrawerComponent,
        MatSidenavModule,
        MatButtonModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockRegistrationRequestService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveDrawerComponent);
    component = fixture.componentInstance;
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
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('handleApproveClick', () => {
    beforeEach(() => {
      component.data = mockDeep<RegistrationRequestListItem>({
        id: 1,
        user: {
          fullNameOrBusinessName: 'John Doe',
          email: 'johndoe@example.com',
        },
        status: 'Pending',
        requestDate: '2025-03-28T00:00:00Z',
      });
    });

    it('should call approveRegistrationRequest and emit approveRequest on success', fakeAsync(() => {
      // Arrange
      const approveSpy = jest.spyOn(component.approveRequest, 'emit');
      mockRegistrationRequestService.approveRegistrationRequest.mockReturnValue(
        of({ message: 'Solicitud aprobada con éxito.' }),
      );

      // Act
      component.handleApproveClick();
      tick();

      // Assert
      expect(
        mockRegistrationRequestService.approveRegistrationRequest,
      ).toHaveBeenCalledWith(1, '');
      expect(component.isLoading()).toBe(false);
      expect(approveSpy).toHaveBeenCalled();
    }));

    it('should handle errors when approveRegistrationRequest fails', fakeAsync(() => {
      // Arrange
      mockRegistrationRequestService.approveRegistrationRequest.mockReturnValue(
        throwError(() => new Error('Error al aprobar')),
      );

      // Act
      component.handleApproveClick();
      tick();

      // Assert
      expect(
        mockRegistrationRequestService.approveRegistrationRequest,
      ).toHaveBeenCalledWith(1, '');
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

    it('should call handleApproveClick when Enter key is pressed', () => {
      // Arrange
      component.data = {
        id: 1,
        user: {
          fullNameOrBusinessName: 'John Doe',
          email: 'johndoe@example.com',
        },
        status: 'Pending',
        requestDate: '2025-03-28T00:00:00Z',
      } as RegistrationRequestListItem;

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(component, 'handleApproveClick');
      mockRegistrationRequestService.approveRegistrationRequest.mockReturnValue(
        of({ message: 'Solicitud aprobada con éxito.' }),
      );

      // Act
      component.handleKeyDown(event);

      // Assert
      expect(component.handleApproveClick).toHaveBeenCalled();
      expect(
        mockRegistrationRequestService.approveRegistrationRequest,
      ).toHaveBeenCalledWith(1, '');
    });

    it('should not call any method for other keys', () => {
      // Arrange
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      jest.spyOn(component, 'closeDrawer');
      jest.spyOn(component, 'handleApproveClick');

      // Act
      component.handleKeyDown(event);

      // Assert
      expect(component.closeDrawer).not.toHaveBeenCalled();
      expect(component.handleApproveClick).not.toHaveBeenCalled();
    });
  });
});
