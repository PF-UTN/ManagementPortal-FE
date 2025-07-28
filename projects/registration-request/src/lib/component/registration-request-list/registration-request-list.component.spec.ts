import { LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { RegistrationRequestListComponent } from './registration-request-list.component';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

describe('RegistrationRequestListComponent', () => {
  let component: RegistrationRequestListComponent;
  let fixture: ComponentFixture<RegistrationRequestListComponent>;
  let service: DeepMockProxy<RegistrationRequestService>;
  let lateralDrawerService: LateralDrawerService;

  const mockData: RegistrationRequestListItem[] = [
    {
      id: 1,
      user: {
        fullNameOrBusinessName: 'John Doe',
        email: 'johndoe@example.com',
        documentNumber: '12345678',
        documentType: 'DNI',
        phone: '123456789',
        taxCategory: 'Responsible Inscripto',
        address: {
          streetAddress: '123 Main St',
          town: 'Springfield',
          zipCode: '12345',
        },
      },
      status: 'Pendiente',
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
        taxCategory: 'Responsible Inscripto',
        address: {
          streetAddress: '123 Main St',
          town: 'Springfield',
          zipCode: '12345',
        },
      },
      status: 'Aprobada',
      requestDate: '2025-03-27T00:00:00Z',
    },
  ];

  beforeEach(() => {
    service = mockDeep<RegistrationRequestService>();
    service.postSearchRegistrationRequest.mockReturnValue(
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
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: RegistrationRequestService, useValue: service },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationRequestListComponent);
    component = fixture.componentInstance;

    lateralDrawerService = TestBed.inject(LateralDrawerService);
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should fetch data on init and update dataSource$ and itemsNumber', fakeAsync(() => {
      // Arrange
      component.ngOnInit();

      // Act
      tick(1100);

      // Assert
      expect(component.dataSource$.value).toEqual(mockData);
      expect(component.itemsNumber).toBe(mockData.length);
      expect(component.isLoading).toBe(false);
    }));

    it('should handle errors when fetchRegistrationRequests fails', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      service.postSearchRegistrationRequest.mockReturnValueOnce(
        throwError(() => new Error('Test error')),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(component.isLoading).toBe(false);
    }));

    it('should send selectedStatus as filter', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      component.selectedStatus = ['Pending', 'Approved'];
      service.postSearchRegistrationRequest.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1000);
      fixture.detectChanges();

      // Assert
      expect(service.postSearchRegistrationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ['Pending', 'Approved'] },
        }),
      );
    }));
  });

  describe('getRowClass', () => {
    it('should return "table__pending-row" for rows with status "Pendiente"', () => {
      // Act
      const rowClass = component.getRowClass(mockData[0]);

      // Assert
      expect(rowClass).toBe('table__pending-row');
    });

    it('should return an empty string for rows with status other than "Pending"', () => {
      // Act
      const rowClass = component.getRowClass(mockData[1]);

      // Assert
      expect(rowClass).toBe('');
    });
  });

  describe('onStatusFilterChange', () => {
    it('should reset pageIndex and trigger doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 2;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onStatusFilterChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should send selectedStatus as filter when changed', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      component.selectedStatus = ['Pending', 'Approved'];
      service.postSearchRegistrationRequest.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1000);

      // Assert
      expect(service.postSearchRegistrationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ['Pending', 'Approved'] },
        }),
      );
    }));
  });

  describe('handlePageChange', () => {
    it('should update pageIndex and pageSize and trigger doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(20);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('onApproveDrawer', () => {
    it('should open the approve drawer and trigger doSearchSubject$', fakeAsync(() => {
      // Arrange
      const request = mockData[0];
      const lateralDrawerOpenSpy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockReturnValue(of(undefined));
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onApproveDrawer(request);
      tick();

      // Assert
      expect(lateralDrawerOpenSpy).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalled();
    }));
  });

  describe('onRejectDrawer', () => {
    it('should open the reject drawer and trigger doSearchSubject$', fakeAsync(() => {
      // Arrange
      const request = mockData[1];
      const lateralDrawerOpenSpy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockReturnValue(of(undefined));
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onRejectDrawer(request);
      tick();

      // Assert
      expect(lateralDrawerOpenSpy).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalled();
    }));
  });

  describe('debounceTime in doSearchSubject$', () => {
    it('should trigger the request only after the debounce time and only once for rapid consecutive triggers', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      const spy = jest.spyOn(service, 'postSearchRegistrationRequest');

      // Act
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      expect(spy).not.toHaveBeenCalled();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });
});
