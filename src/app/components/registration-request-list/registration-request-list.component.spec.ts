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
    component.handleAction(mockData[0], 'approve');
    expect(component.onApprove).toHaveBeenCalledWith(mockData[0]);
  });

  it('should handle the "reject" action', () => {
    jest.spyOn(component, 'onReject');
    component.handleAction(mockData[1], 'reject');
    expect(component.onReject).toHaveBeenCalledWith(mockData[1]);
  });

  it('should call fetchData when page changes', () => {
    jest.spyOn(component, 'fetchData');
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
    expect(component.fetchData).toHaveBeenCalled();
  });

  it('should return empty string for invalid row in getRowClass', () => {
    jest.spyOn(console, 'warn');
    const invalidRow1: registrationRequestList = {
      id: 0,
      user: {
        fullNameOrBusinessName: '',
        email: '',
        documentNumber: '',
        documentType: '',
        phone: ''
      },
      status: '',
      requestDate: ''
    };

    const invalidRow2: registrationRequestList = {
      id: 0,
      user: {
        fullNameOrBusinessName: '',
        email: '',
        documentNumber: '',
        documentType: '',
        phone: ''
      },
      status: '',
      requestDate: ''
    };
    expect(component.getRowClass(invalidRow1)).toBe('');
    expect(component.getRowClass(invalidRow2)).toBe('');
    expect(console.warn).toHaveBeenCalledWith('Fila inválida o estado no definido:', invalidRow1);
    expect(console.warn).toHaveBeenCalledWith('Fila inválida o estado no definido:', invalidRow2);
  });

  it('should throw error for unknown action', () => {
    expect(() => component.handleAction(mockData[0], 'invalid-action'))
      .toThrowError('Acción no reconocida: invalid-action');
  });

  it('should log details when onViewDetail is called', () => {
    jest.spyOn(console, 'log');
    const row = mockData[0];
    component.onViewDetail(row);
    expect(console.log).toHaveBeenCalledWith('Ver detalle de:', row);
  });

  it('should update pageIndex and pageSize on page change', () => {
    component.onPageChange({ pageIndex: 2, pageSize: 20 });
    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(20);
  });

  it('should apply correct row class based on status', () => {
    const pendingRow = mockData[0];
    const approvedRow = mockData[1];
  
    expect(component.getRowClass(pendingRow)).toBe('pending-row');
    expect(component.getRowClass(approvedRow)).toBe('');
  });

  it('should call fetchData on initialization', () => {
    jest.spyOn(component, 'fetchData');
    component.ngOnInit();
    expect(component.fetchData).toHaveBeenCalled();
  });

  it('should call onViewDetail when action is "viewDetail"', () => {
    jest.spyOn(component, 'onViewDetail');
    const row = mockData[0];
    component.handleAction(row, 'viewDetail');
    expect(component.onViewDetail).toHaveBeenCalledWith(row);
  });

  it('should initialize dataSource$ as empty', () => {
    expect(component.dataSource$.getValue()).toEqual([]);
  });

  it('should call fetchData when onPageChange is triggered', () => {
    jest.spyOn(component, 'fetchData');
    component.onPageChange({ pageIndex: 1, pageSize: 20 });
    expect(component.fetchData).toHaveBeenCalled();
  });
});