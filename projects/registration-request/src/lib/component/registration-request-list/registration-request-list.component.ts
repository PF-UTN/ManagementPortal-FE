import { downloadFileFromResponse } from '@Common';
import {
  ButtonComponent,
  ColumnTypeEnum,
  LateralDrawerService,
  PillStatusEnum,
  TableColumn,
  TableComponent,
  InputComponent,
  TitleComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { ActionsRequest } from '../../constants/actions.enum';
import { DownloadRegistrationRequestRequest } from '../../models/download-registration-request.request';
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
    ButtonComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    InputComponent,
    TitleComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registration-request-list.component.html',
  styleUrl: './registration-request-list.component.scss',
})
export class RegistrationRequestListComponent implements OnInit {
  columns: TableColumn<RegistrationRequestListItem>[] = [
    {
      columnDef: 'name',
      header: 'NOMBRE COMPLETO | RAZÓN SOCIAL',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) =>
        element.user.fullNameOrBusinessName,
    },
    {
      columnDef: 'email',
      header: 'EMAIL',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) => element.user.email,
    },
    {
      columnDef: 'status',
      header: 'ESTADO',
      type: ColumnTypeEnum.PILL,
      value: (element: RegistrationRequestListItem) => element.status,
      pillStatus: (element: RegistrationRequestListItem) => {
        switch (element.status) {
          case 'Pendiente':
            return PillStatusEnum.Initial;
          case 'Aprobada':
            return PillStatusEnum.Done;
          case 'Rechazada':
            return PillStatusEnum.Cancelled;
          default:
            throw new Error(`Unhandled status: ${element.status}`);
        }
      },
      width: '100px',
    },
    {
      columnDef: 'requestDate',
      header: 'FECHA DE SOLICITUD',
      type: ColumnTypeEnum.VALUE,
      value: (element: RegistrationRequestListItem) =>
        new Date(element.requestDate).toLocaleDateString(),
      width: '150px',
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
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
      width: '50px',
    },
  ];
  dataSource$ = new BehaviorSubject<RegistrationRequestListItem[]>([]);
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;
  selectedStatus: string[] = [];
  searchText: string = '';

  actionsRequest = ActionsRequest;

  isDrawerApproveOpen: boolean = false;
  isDrawerRejectOpen: boolean = false;
  selectedRequest: RegistrationRequestListItem;

  doSearchSubject$ = new Subject<void>();

  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params = this.getRegistrationRequestParams();
          return this.registrationRequestService.postSearchRegistrationRequest(
            params,
          );
        }),
      )
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
    this.doSearchSubject$.next();
  }

  private getRegistrationRequestParams(): RegistrationRequestParams {
    const params: RegistrationRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: this.searchText || '',
      filters: {},
    };

    if (this.selectedStatus && this.selectedStatus.length > 0) {
      params.filters = { status: this.selectedStatus };
    }

    return params;
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }

  onSearchTextChange(): void {
    this.pageIndex = 0;
    this.isLoading = true;
    this.doSearchSubject$.next();
  }

  onClearSearch() {
    this.searchText = '';
    this.onSearchTextChange();
  }

  onApproveDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService
      .open(
        ApproveLateralDrawerComponent,
        { data: request },
        {
          title: 'Aprobar Solicitud',
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
          size: 'small',
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  onRejectDrawer(request: RegistrationRequestListItem): void {
    this.lateralDrawerService
      .open(
        RejectLateralDrawerComponent,
        { data: request },
        {
          title: 'Rechazar Solicitud',
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
          size: 'small',
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  closeDrawer(): void {
    this.isDrawerApproveOpen = false;
    this.isDrawerRejectOpen = false;
  }

  handleDownloadClick(): void {
    const searchParams = this.getRegistrationRequestParams();

    const downloadRequest: DownloadRegistrationRequestRequest = {
      searchText: searchParams.searchText,
      filters: searchParams.filters,
    };

    this.registrationRequestService
      .postDownloadRegistrationRequest(downloadRequest)
      .subscribe((response) => {
        downloadFileFromResponse(response, 'solicitudes_registro.xlsx');
      });
  }

  getRowClass = (row: RegistrationRequestListItem): string => {
    return row.status === 'Pendiente' ? 'table__pending-row' : '';
  };

  isActionDisabled = (element: RegistrationRequestListItem): boolean => {
    return element.status !== 'Pendiente';
  };
}
