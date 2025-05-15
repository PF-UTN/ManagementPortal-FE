import {
  ColumnTypeEnum,
  LateralDrawerService,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestParams } from '../../models/registration-request-param.model';
import { RegistrationRequestService } from '../../services/registration-request.service';
import { ApproveLateralDrawerComponent } from '../approve-lateral-drawer/approve-lateral-drawer.component';
import { RejectLateralDrawerComponent } from '../reject-lateral-drawer/reject-lateral-drawer.component';

@Component({
  selector: 'mp-registration-request-list',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registration-request-list.component.html',
  styleUrl: './registration-request-list.component.scss',
})
export class RegistrationRequestListComponent implements OnInit {
  columns: TableColumn<RegistrationRequestListItem>[] = [
    {
      columnDef: 'name',
      header: 'Nombre Completo | Razón Social',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) =>
        element.user.fullNameOrBusinessName,
    },
    {
      columnDef: 'email',
      header: 'Email',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) => element.user.email,
    },
    {
      columnDef: 'status',
      header: 'Estado',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) => element.status,
    },
    {
      columnDef: 'requestDate',
      header: 'Fecha de Solicitud',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) =>
        new Date(element.requestDate).toLocaleDateString(),
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Aprobar',
          action: (element: RegistrationRequestListItem) =>
            this.onApproveDrawer(element),
        },
        {
          description: 'Rechazar',
          action: (element: RegistrationRequestListItem) =>
            this.onRejectDrawer(element),
        },
      ],
    },
  ];
  dataSource$ = new BehaviorSubject<RegistrationRequestListItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;
  selectedStatus: string[] = [];

  isDrawerApproveOpen: boolean = false;
  isDrawerRejectOpen: boolean = false;
  selectedRequest: RegistrationRequestListItem;

  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.fetchData();
  }

  get noDataMessage(): string {
    if (!this.selectedStatus || this.selectedStatus.length === 0) {
      return 'No hay solicitudes de registro disponibles';
    }
    if (this.selectedStatus.length === 1) {
      const estado = this.selectedStatus[0];
      if (estado === 'Pending')
        return 'No hay solicitudes de registro pendientes';
      if (estado === 'Approved')
        return 'No hay solicitudes de registro aprobadas';
      if (estado === 'Rejected')
        return 'No hay solicitudes de registro rechazadas';
    }
    return 'No hay solicitudes de registro disponibles para los estados seleccionados';
  }

  fetchData(): void {
    this.isLoading = true;
    const params: RegistrationRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: '',
      filters: {},
    };

    if (this.selectedStatus && this.selectedStatus.length > 0) {
      params.filters = { status: this.selectedStatus };
    }

    this.registrationRequestService
      .postSearchRegistrationRequest(params)
      .subscribe({
        next: (response) => {
          this.dataSource$.next(response.results);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener los datos:', err);
          this.isLoading = false;
        },
      });
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  onApproveDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService
      .open(
        ApproveLateralDrawerComponent,
        { data: request },
        {
          title: 'Aprobar Solicitud de Registro',
          footer: {
            firstButton: {
              text: 'Confirmar',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => {
                this.lateralDrawerService.close();
              },
            },
          },
        },
      )
      .subscribe(() => this.fetchData());
  }

  onRejectDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService
      .open(
        RejectLateralDrawerComponent,
        { data: request },
        {
          title: 'Rechazar Solicitud de Registro',
          footer: {
            firstButton: {
              text: 'Confirmar',
              click: () => {},
            },
            secondButton: {
              text: 'Cancelar',
              click: () => {
                this.lateralDrawerService.close();
              },
            },
          },
        },
      )
      .subscribe(() => this.fetchData());
  }

  closeDrawer(): void {
    this.isDrawerApproveOpen = false;
    this.isDrawerRejectOpen = false;
  }

  getRowClass = (row: RegistrationRequestListItem): string => {
    return row.status === 'Pending' ? 'table__pending-row' : '';
  };
}
