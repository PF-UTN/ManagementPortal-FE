import { ColumnTypeEnum, TableColumn, TableComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestParams } from '../../models/registration-request-param.model';
import { RegistrationRequestService } from '../../services/registration-request.service';
import { ApproveDrawerComponent } from '../approve/approve.component';
import { RejectDrawerComponent } from '../reject/reject.component';

@Component({
  selector: 'mp-registration-request-list',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    ApproveDrawerComponent,
    RejectDrawerComponent,
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

  isDrawerApproveOpen: boolean = false;
  isDrawerRejectOpen: boolean = false;
  selectedRequest: RegistrationRequestListItem;

  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
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
    this.selectedRequest = request;
    this.isDrawerApproveOpen = true;
    setTimeout(() => {
      const drawerElement = document.querySelector('.drawer-container__drawer');
      if (drawerElement) {
        (drawerElement as HTMLElement).focus();
      }
    });
  }

  onRejectDrawer(request: RegistrationRequestListItem): void {
    this.selectedRequest = request;
    this.isDrawerRejectOpen = true;
    setTimeout(() => {
      const drawerElement = document.querySelector('.drawer-container__drawer');
      if (drawerElement) {
        (drawerElement as HTMLElement).focus();
      }
    });
  }

  closeDrawer(): void {
    this.isDrawerApproveOpen = false;
    this.isDrawerRejectOpen = false;
  }

  getRowClass = (row: RegistrationRequestListItem): string => {
    return row.status === 'Pending' ? 'table__pending-row' : '';
  };
}
