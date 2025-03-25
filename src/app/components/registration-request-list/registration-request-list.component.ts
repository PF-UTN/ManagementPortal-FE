import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TableColumn } from 'projects/common-ui/src/lib/models/table-column.model';
import { registrationRequestList } from 'src/app/models/registration-request-list.model';

@Component({
  selector: 'app-registration-request-list',
  templateUrl: './registration-request-list.component.html',
  styleUrl: './registration-request-list.component.scss'
})
export class RegistrationRequestListComponent implements OnInit {
  columns: TableColumn<registrationRequestList>[] = [
    { columnDef: 'name', header: 'Nombre | Razon Social', type: 'value', value: (element: registrationRequestList) => element.name },
    { columnDef: 'email', header: 'Correo', type: 'value', value: (element: registrationRequestList) => element.email },
    { columnDef: 'status', header: 'Estado', type: 'value', value: (element: registrationRequestList) => element.status },
    { columnDef: 'startDate', header: 'Fecha de Registro', type: 'value', value: (element: registrationRequestList) => element.startDate }
  ];
  dataSource: RegistrationRequestListComponent[];
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  
  constructor(private http: HttpClient) {
    this.dataSource = [];
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.http.get<RegistrationRequestListComponent[]>('/registration-application/search').subscribe({
      next: (data) => {
        this.dataSource = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: { pageIndex: number, pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onApprove(request: RegistrationRequestListComponent): void {
    console.log('Aprobando solicitud:', request);
  }

  onReject(request: RegistrationRequestListComponent): void {
    console.log('Rechazando solicitud:', request);
  }

  onViewDetail(request: RegistrationRequestListComponent): void {
    console.log('Ver detalle de:', request);
  }
}
