import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit} from '@angular/core';
import { registrationRequestList } from 'src/app/models/registration-request-list.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TableComponent, TableColumn } from '@common-ui';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'mp-registration-request-list',
  standalone: true,
  imports: [MatPaginatorModule, TableComponent, CommonModule, HttpClientModule, MatIconModule, MatMenuModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registration-request-list.component.html',
  styleUrl: './registration-request-list.component.scss'
})
export class RegistrationRequestListComponent implements OnInit {
  
  private apiUrl = 'https://dev-management-portal-be.vercel.app/registration-request/search';

  columns: TableColumn<registrationRequestList>[] = [
    { columnDef: 'name', header: 'Nombre Completo | Razón Social', type: 'value', value: (element: registrationRequestList) => element.user.fullNameOrBusinessName },
    { columnDef: 'email', header: 'Email', type: 'value', value: (element: registrationRequestList) => element.user.email },
    { columnDef: 'status', header: 'Estado', type: 'value', value: (element: registrationRequestList) => element.status},
    { columnDef: 'requestDate', header: 'Fecha de Solicitud', type: 'value', value: (element: registrationRequestList) => new Date(element.requestDate).toLocaleDateString() },
    { columnDef: 'actions', header: 'Acciones', type: 'action', action: (element: registrationRequestList, actionType: string) => this.handleAction(element, actionType),},
  ];
  dataSource$ = new BehaviorSubject<registrationRequestList[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
 
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }
  
  fetchData(): void {
    this.isLoading = true;
    this.http.post<{ total: number; results: registrationRequestList[] }>(this.apiUrl, {
      searchText: "",
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      filters: {}
    }).subscribe({
      next: (response) => {
        this.dataSource$.next(response.results); 
        this.totalItems = response.total; 
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  handleAction(element: registrationRequestList, actionType: string): void {
  switch (actionType) {
    case 'viewDetail':
      this.onViewDetail(element);
      break;
    case 'approve':
      this.onApprove(element);
      break;
    case 'reject':
      this.onReject(element);
      break;
    default:
      console.warn('Acción no reconocida:', actionType);
  }
}
  
  onPageChange(event: { pageIndex: number, pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  onApprove(request: registrationRequestList): void {
    console.log('Aprobando solicitud:', request);
  }

  onReject(request: registrationRequestList): void {
    console.log('Rechazando solicitud:', request);
  }

  onViewDetail(request: registrationRequestList): void {
    console.log('Ver detalle de:', request);
  }

  getRowClass = (row: registrationRequestList): string => {
    return row.status === 'Pending' ? 'pending-row' : '';
  };
}
