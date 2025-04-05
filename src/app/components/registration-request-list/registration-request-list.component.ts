import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableColumn } from 'projects/common-ui/src/lib/models/table-column.model';
import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';
import { TableComponent } from '@common-ui';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RegistrationRequestParams } from '../../models/registration-request-param.model';

@Component({
  selector: 'mp-registration-request-list',
  standalone: true,
  imports: [TableComponent, CommonModule, MatIconModule, MatMenuModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registration-request-list.component.html',
  styleUrl: './registration-request-list.component.scss'
})
export class RegistrationRequestListComponent implements OnInit {
  columns: TableColumn<RegistrationRequestListItem>[] = [
    { columnDef: 'name', header: 'Nombre Completo | Razón Social', type: 'value', value: (element: RegistrationRequestListItem) => element.user.fullNameOrBusinessName },
    { columnDef: 'email', header: 'Email', type: 'value', value: (element: RegistrationRequestListItem) => element.user.email },
    { columnDef: 'status', header: 'Estado', type: 'value', value: (element: RegistrationRequestListItem) => element.status },
    { columnDef: 'requestDate', header: 'Fecha de Solicitud', type: 'value', value: (element: RegistrationRequestListItem) => new Date(element.requestDate).toLocaleDateString() },
    { columnDef: 'actions', header: 'Acciones', type: 'action' },
  ];
  dataSource$ = new BehaviorSubject<RegistrationRequestListItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(private registrationRequestService: RegistrationRequestService) {}

  ngOnInit(): void {
    this.fetchData();
  }
  
  fetchData(): void {
    this.isLoading = true;
    const params: RegistrationRequestParams = {
      page: this.pageIndex + 1, 
      pageSize: this.pageSize,
      searchText: '',
      filters: {}
    };

    this.registrationRequestService.fetchRegistrationRequests(params).subscribe({
      next: (response) => {
        this.dataSource$.next(response.results);
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener los datos:', err);
        this.isLoading = false;
      }
    });
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  onViewDetail(request: RegistrationRequestListItem): void {
    console.log('Ver detalle de:', request);
  }

  onApprove(request: RegistrationRequestListItem): void {
    console.log('Aprobando solicitud:', request);
  }

  onReject(request: RegistrationRequestListItem): void {
    console.log('Rechazando solicitud:', request);
  }

  getRowClass = (row: RegistrationRequestListItem): string => {
    return row.status === 'Pending' ? 'pending-row' : '';
  };
}