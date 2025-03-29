import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationRequestListComponent } from './registration-request-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { registrationRequestList } from 'src/app/models/registration-request-list.model';

describe('RegistrationRequestListComponent', () => {
  let component: RegistrationRequestListComponent;
  let fixture: ComponentFixture<RegistrationRequestListComponent>;
  let httpMock: HttpTestingController;

  const mockData: registrationRequestList[] = [
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistrationRequestListComponent,
        HttpClientTestingModule,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationRequestListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle the "approve" action', () => {
    jest.spyOn(component, 'onApprove');
    const row = mockData[0];
    component.handleAction(row, 'approve');
    expect(component.onApprove).toHaveBeenCalledWith(row);
  });

  it('should handle the "reject" action', () => {
    jest.spyOn(component, 'onReject');
    const row = mockData[1];
    component.handleAction(row, 'reject');
    expect(component.onReject).toHaveBeenCalledWith(row);
  });

  it('should call fetchData when page changes', () => {
    jest.spyOn(component, 'fetchData');
    const pageChangeEvent = { pageIndex: 1, pageSize: 10 };
    component.onPageChange(pageChangeEvent);
    expect(component.fetchData).toHaveBeenCalled();
  });

  it('should update row class based on status', () => {
    const row = mockData[0];
    expect(component.getRowClass(row)).toBe('pending-row');

    const approvedRow = mockData[1];
    expect(component.getRowClass(approvedRow)).toBe('');
  });

  it('should log details when onViewDetail is called', () => {
    jest.spyOn(console, 'log');
    const row = mockData[0];
    component.onViewDetail(row);
    expect(console.log).toHaveBeenCalledWith('Ver detalle de:', row);
  });

  it('should log rejection when onReject is called', () => {
    jest.spyOn(console, 'log');
    const row = mockData[1];
    component.onReject(row);
    expect(console.log).toHaveBeenCalledWith('Rechazando solicitud:', row);
  });

  it('should log approval when onApprove is called', () => {
    jest.spyOn(console, 'log');
    const row = mockData[0];
    component.onApprove(row);
    expect(console.log).toHaveBeenCalledWith('Aprobando solicitud:', row);
  });

  it('should return empty string for invalid row in getRowClass', () => {
    jest.spyOn(console, 'warn');
    expect(component.getRowClass(null as any)).toBe('');
    expect(console.warn).toHaveBeenCalledWith('Fila inválida o estado no definido:', null);
  });
});