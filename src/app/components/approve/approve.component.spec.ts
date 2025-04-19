import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApproveDrawerComponent } from './approve.component';
import { RegistrationRequestService } from '../../services/registration-request.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';

describe('ApproveDrawerComponent', () => {
  let component: ApproveDrawerComponent;
  let fixture: ComponentFixture<ApproveDrawerComponent>;
  let mockRegistrationRequestService: jest.Mocked<RegistrationRequestService>;

  beforeEach(async () => {
    mockRegistrationRequestService = {
      approveRegistrationRequest: jest.fn(),
      fetchRegistrationRequests: jest.fn(),
    } as Partial<jest.Mocked<RegistrationRequestService>> as jest.Mocked<RegistrationRequestService>;
  
    await TestBed.configureTestingModule({
      imports: [
        ApproveDrawerComponent,
        MatSidenavModule,
        MatButtonModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: RegistrationRequestService, useValue: mockRegistrationRequestService },
      ],
    }).compileComponents();
  
    fixture = TestBed.createComponent(ApproveDrawerComponent);
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

  describe('approve', () => {
    beforeEach(() => {
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
    });
  
    it('should call approveRegistrationRequest and emit approveRequest on success', fakeAsync(() => {
      // Arrange
      jest.spyOn(component.approveRequest, 'emit');
      mockRegistrationRequestService.approveRegistrationRequest.mockReturnValue(of(void 0));
  
      // Act
      component.approve();
      fixture.detectChanges(); 
  
      tick(); 
      fixture.detectChanges(); 
  
      // Assert
      expect(mockRegistrationRequestService.approveRegistrationRequest).toHaveBeenCalledWith(1, '');
      expect(component.isLoading).toBe(false); 
      expect(component.approveRequest.emit).toHaveBeenCalled();
    }));
  
    it('should handle errors when approveRegistrationRequest fails', fakeAsync(() => {
      // Arrange
      mockRegistrationRequestService.approveRegistrationRequest.mockReturnValue(
        throwError(() => new Error('Error al aprobar'))
      );
  
      // Act
      component.approve();
      fixture.detectChanges(); 
  
      tick(); 
      fixture.detectChanges(); 
  
      // Assert
      expect(mockRegistrationRequestService.approveRegistrationRequest).toHaveBeenCalledWith(1, '');
      expect(component.isLoading).toBe(false); 
    }));
  });
});