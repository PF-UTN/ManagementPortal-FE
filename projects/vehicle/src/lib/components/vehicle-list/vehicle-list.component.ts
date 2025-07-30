import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  LateralDrawerService,
  TableColumn,
  TableComponent,
  ModalComponent,
  ModalConfig,
} from '@Common-UI';

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { VehicleListItem } from '../../models/vehicle-item.model';
import { VehicleParams } from '../../models/vehicle-params.model';
import { VehicleService } from '../../services/vehicle.service';
import { CreateVehicleDrawerComponent } from '../create-vehicle-drawer/create-vehicle-drawer.component';

@Component({
  selector: 'mp-vehicle-list',
  standalone: true,
  imports: [TableComponent, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit {
  columns: TableColumn<VehicleListItem>[] = [
    {
      columnDef: 'licensePlate',
      header: 'Patente',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.licensePlate,
    },
    {
      columnDef: 'brand',
      header: 'Marca',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.brand,
    },
    {
      columnDef: 'model',
      header: 'Modelo',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.model,
    },
    {
      columnDef: 'kmTraveled',
      header: 'Kilometraje actual',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        typeof element.kmTraveled === 'number' && !isNaN(element.kmTraveled)
          ? `${element.kmTraveled.toLocaleString('de-DE')} km`
          : '',
    },
    {
      columnDef: 'admissionDate',
      header: 'Fecha de ingreso',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        this.formatDate(element.admissionDate),
    },
    {
      columnDef: 'enabled',
      header: 'Estado',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        element.enabled ? 'Habilitado' : 'No habilitado',
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: VehicleListItem) => {
            console.log('View details for vehicle:', element);
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
              if (result) {
                this.doSearchSubject$.next();
                this.snackBar.open(
                  'Vehículo eliminado correctamente',
                  'Cerrar',
                  {
                    duration: 3000,
                  },
                );
                this.vehicleService
                  .deleteVehicleAsync(element.id)
                  .subscribe({});
              }
            });
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
                },
              )
              .subscribe(() => this.doSearchSubject$.next());
          },
        },
        {
          description: 'Deshabilitar',
          action: (element: VehicleListItem) => {
            // Implement disable action here
            console.log('Disable vehicle:', element);
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

  public formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
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
        },
      )
      .subscribe(() => this.doSearchSubject$.next());
  }

  onButtonKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openCreateVehicleDrawer();
    }
  }
}
