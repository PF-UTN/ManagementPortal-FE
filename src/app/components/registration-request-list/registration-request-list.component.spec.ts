import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationRequestListComponent } from './registration-request-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RegistrationRequestService } from '../../services/registration-request.service';
import { of, throwError } from 'rxjs';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';

describe('RegistrationRequestListComponent', () => {
  let component: RegistrationRequestListComponent;
  let fixture: ComponentFixture<RegistrationRequestListComponent>;
  let httpMock: HttpTestingController;
  let service: RegistrationRequestService;

  const mockData: RegistrationRequestListItem[] = [
    {
      id: 1,
      user: {
        fullNameOrBusinessName: 'John Doe',
        email: 'johndoe@example.com',
        documentNumber: '12345678',
        documentType: 'DNI',
        phone: '123456789'
      },
      status: 'Pending',
      requestDate: '2025-03-28T00:00:00Z'
    },
    {
      id: 2,
      user: {
        fullNameOrBusinessName: 'Jane Smith',
        email: 'janesmith@example.com',
        documentNumber: '87654321',
        documentType: 'DNI',
        phone: '987654321'
      },
      status: 'Approved',
      requestDate: '2025-03-27T00:00:00Z'
    }
  ];

  beforeEach(() => {
    const mockService = {
      fetchRegistrationRequests: jest.fn().mockReturnValue(of({ total: mockData.length, results: mockData }))
    };
  
    TestBed.configureTestingModule({
      imports: [
        RegistrationRequestListComponent,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule
      ],
      providers: [
        { provide: RegistrationRequestService, useValue: mockService }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(RegistrationRequestListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RegistrationRequestService);
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
      jest.spyOn(service, 'fetchRegistrationRequests').mockReturnValue(throwError(() => new Error('Test error')));
    
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
    it('should log approval message', () => {
      // Arrange
      jest.spyOn(console, 'log');
      const row = mockData[0];

      // Act
      component.onApprove(row);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Aprobando solicitud:', row);
    });
  });

  describe('onReject', () => {
    it('should log rejection message', () => {
      // Arrange
      jest.spyOn(console, 'log');
      const row = mockData[1];

      // Act
      component.onReject(row);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Rechazando solicitud:', row);
    });
  });

  describe('getRowClass', () => {
    it('should return "pending-row" for rows with status "Pending"', () => {
      // Arrange
      const row = mockData[0];

      // Act
      const result = component.getRowClass(row);

      // Assert
      expect(result).toBe('pending-row');
    });

    it('should return an empty string for rows with status other than "Pending"', () => {
      // Arrange
      const row = mockData[1];

      // Act
      const result = component.getRowClass(row);

      // Assert
      expect(result).toBe('');
    });
  });
});