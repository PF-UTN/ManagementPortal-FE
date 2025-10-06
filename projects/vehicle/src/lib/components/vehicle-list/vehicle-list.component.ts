import { downloadFileFromResponse, VehicleService } from '@Common';
import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  LateralDrawerService,
  TableColumn,
  TableComponent,
  ModalComponent,
  ModalConfig,
  PillStatusEnum,
} from '@Common-UI';

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { VehicleListItem } from '../../../../../common/src/models/vehicle/vehicle-item.model';
import { VehicleParams } from '../../../../../common/src/models/vehicle/vehicle-params.model';
import { VehicleUpdate } from '../../../../../common/src/models/vehicle/vehicle-update.model';
import { CreateVehicleDrawerComponent } from '../create-vehicle-drawer/create-vehicle-drawer.component';
import { DetailVehicleDrawerComponent } from '../detail-vehicle-drawer/detail-vehicle-drawer.component';

@Component({
  selector: 'mp-vehicle-list',
  standalone: true,
  imports: [TableComponent, FormsModule, InputComponent, ButtonComponent],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit {
  columns: TableColumn<VehicleListItem>[] = [
    {
      columnDef: 'licensePlate',
      header: 'PATENTE',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.licensePlate,
    },
    {
      columnDef: 'brand',
      header: 'MARCA',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.brand,
    },
    {
      columnDef: 'model',
      header: 'MODELO',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.model,
    },
    {
      columnDef: 'kmTraveled',
      header: 'KILOMETRAJE ACTUAL',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        this.decimalPipe.transform(element.kmTraveled, '1.0-0')! + ' km',
    },
    {
      columnDef: 'admissionDate',
      header: 'FECHA DE INGRESO',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        this.datePipe.transform(element.admissionDate, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'enabled',
      header: 'ESTADO',
      type: ColumnTypeEnum.PILL,
      value: (element: VehicleListItem) =>
        element.enabled ? 'Habilitado' : 'No habilitado',
      pillStatus: (element: VehicleListItem) =>
        element.enabled ? PillStatusEnum.Done : PillStatusEnum.Cancelled,
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: VehicleListItem) => {
            this.lateralDrawerService.open(
              DetailVehicleDrawerComponent,
              { data: element },
              {
                title: 'Detalles de Vehículo',
                footer: {
                  firstButton: {
                    text: 'Cerrar',
                    click: () => {
                      this.lateralDrawerService.close();
                    },
                  },
                },
                size: 'small',
              },
            );
          },
        },
        {
          description: 'Editar',
          action: (element: VehicleListItem) => {
            this.lateralDrawerService
              .open(
                CreateVehicleDrawerComponent,
                { data: element },
                {
                  title: 'Editar Vehículo',
                  footer: {
                    firstButton: {
                      text: 'Guardar',
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
          },
        },
        {
          description: 'Habilitar / Deshabilitar',
          action: (element: VehicleListItem) => {
            const dialogRef = this.dialog.open(ModalComponent, {
              data: {
                title: `${element.enabled ? 'Deshabilitar' : 'Habilitar'} vehículo`,
                message: `¿Está seguro que desea ${element.enabled ? 'deshabilitar' : 'habilitar'} este vehículo?`,
                cancelText: 'Cancelar',
                confirmText: 'Confirmar',
              } as ModalConfig,
            });
            dialogRef.afterClosed().subscribe((result: boolean) => {
              if (!result) {
                return;
              }
              this.isLoading = true;

              const request = {
                brand: element.brand,
                model: element.model,
                kmTraveled: element.kmTraveled,
                admissionDate: element.admissionDate,
                enabled: !element.enabled,
              } as VehicleUpdate;

              this.vehicleService
                .updateVehicleAsync(element.id, request)
                .subscribe(() => {
                  this.doSearchSubject$.next();
                  this.snackBar.open(
                    `Vehículo ${element.enabled ? 'deshabilitado' : 'habilitado'} correctamente`,
                    'Cerrar',
                    { duration: 3000 },
                  );
                });
            });
          },
        },
        {
          description: 'Eliminar',
          action: (element: VehicleListItem) => {
            const dialogRef = this.dialog.open(ModalComponent, {
              data: {
                title: 'Eliminar vehículo',
                message:
                  '¿Está seguro que desea eliminar este vehículo? Esta acción no se puede deshacer.',
                cancelText: 'Cancelar',
                confirmText: 'Eliminar',
              } as ModalConfig,
            });
            dialogRef.afterClosed().subscribe((result: boolean) => {
              if (!result) {
                return;
              }

              this.vehicleService
                .deleteVehicleAsync(element.id)
                .subscribe(() => {
                  this.doSearchSubject$.next();
                  this.snackBar.open(
                    'Vehículo eliminado correctamente',
                    'Cerrar',
                    { duration: 3000 },
                  );
                });
            });
          },
        },
        {
          description: 'Mantenimiento',
          action: (element: VehicleListItem) => {
            this.router.navigate(['vehiculos', element.id, 'mantenimiento']);
          },
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<VehicleListItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = true;
  pageIndex: number = 0;
  pageSize: number = 10;
  doSearchSubject$ = new Subject<void>();
  searchText: string = '';

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly decimalPipe: DecimalPipe,
    private readonly datePipe: DatePipe,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params: VehicleParams = {
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
            searchText: this.searchText,
          };
          return this.vehicleService.postSearchVehiclesAsync(params);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dataSource$.next(response.results);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al obtener los datos:', error);
          this.isLoading = false;
        },
      });
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

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }

  openCreateVehicleDrawer(): void {
    this.lateralDrawerService
      .open(
        CreateVehicleDrawerComponent,
        {},
        {
          title: 'Nuevo Vehículo',
          footer: {
            firstButton: {
              text: 'Guardar',
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

  onButtonKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openCreateVehicleDrawer();
    }
  }

  handleDownloadClick(): void {
    const params: VehicleParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchText: this.searchText,
    };

    this.vehicleService.downloadVehicleList(params).subscribe((response) => {
      downloadFileFromResponse(response, 'vehiculos.xlsx');
    });
  }
}
