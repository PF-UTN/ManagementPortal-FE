import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { RegistrationRequestListComponent } from './registration-request-list.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('RegistrationRequestListComponent', () => {
  let component: RegistrationRequestListComponent;
  let fixture: ComponentFixture<RegistrationRequestListComponent>;
  let service: DeepMockProxy<RegistrationRequestService>;

  const mockData: RegistrationRequestListItem[] = [
    {
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
    },
    {
      id: 2,
      user: {
        fullNameOrBusinessName: 'Jane Smith',
        email: 'janesmith@example.com',
        documentNumber: '87654321',
        documentType: 'DNI',
        phone: '987654321',
      },
      status: 'Approved',
      requestDate: '2025-03-27T00:00:00Z',
    },
  ];

  beforeEach(() => {
    service = mockDeep<RegistrationRequestService>();
    service.fetchRegistrationRequests.mockReturnValue(
      of({ total: mockData.length, results: mockData }),
    );

    TestBed.configureTestingModule({
      imports: [
        RegistrationRequestListComponent,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
      ],
      providers: [{ provide: RegistrationRequestService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(component.dataSource$.value).toEqual(mockData);
    expect(component.totalItems).toBe(mockData.length);
    expect(component.isLoading).toBe(false);
  });

  describe('fetchData', () => {
    it('should update dataSource$ and totalItems with mock data', () => {
      // Act
      component.fetchData();

      // Assert
      expect(component.dataSource$.value).toEqual(mockData);
      expect(component.totalItems).toBe(mockData.length);
      expect(component.isLoading).toBe(false);
    });

    it('should handle errors when fetchRegistrationRequests fails', () => {
      // Arrange
      service.fetchRegistrationRequests.mockReturnValue(
        throwError(() => new Error('Test error')),
      );

      // Act
      component.fetchData();

      // Assert
      expect(component.isLoading).toBe(false);
    });
  });

  describe('handlePageChange', () => {
    it('should update pageIndex and pageSize and call fetchData', () => {
      // Arrange
      jest.spyOn(component, 'fetchData');
      const event = { pageIndex: 1, pageSize: 20 };

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(20);
      expect(component.fetchData).toHaveBeenCalled();
      expect(component.dataSource$.value).toEqual(mockData);
      expect(component.totalItems).toBe(mockData.length);
    });
  });

  describe('onApprove', () => {
    it('should set selectedRequest and open the drawer', () => {
      // Arrange
      const request = mockData[0];

      // Act
      component.onApprove(request);

      // Assert
      expect(component.selectedRequest).toBe(request);
      expect(component.isDrawerOpen).toBe(true);
    });
  });

  describe('closeDrawer', () => {
    it('should close the drawer', () => {
      // Arrange
      component.isDrawerOpen = true;

      // Act
      component.closeDrawer();

      // Assert
      expect(component.isDrawerOpen).toBe(false);
    });
  });
});
