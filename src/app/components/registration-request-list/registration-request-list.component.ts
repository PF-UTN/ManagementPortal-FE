import {
  ColumnTypeEnum,
  LateralDrawerService,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
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
    ApproveLateralDrawerComponent,
    RejectLateralDrawerComponent,
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
  totalItems: number = 0;
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

  fetchData(): void {
    this.isLoading = true;
    const params: RegistrationRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: '',
      filters: {},
    };

    this.registrationRequestService
      .postSearchRegistrationRequest(params)
      .subscribe({
        next: (response) => {
          this.dataSource$.next(response.results);
          this.totalItems = response.total;
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

  onViewDetail(request: RegistrationRequestListItem): void {
    console.log('Ver detalle de:', request);
  }

  onApproveDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService.open(
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
    );
  }

  closeDrawer(): void {
    this.isDrawerApproveOpen = false;
  }

  onRejectDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService.open(
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
    );
  }

  getRowClass = (row: RegistrationRequestListItem): string => {
    return row.status === 'Pending' ? 'table__pending-row' : '';
  };
}
