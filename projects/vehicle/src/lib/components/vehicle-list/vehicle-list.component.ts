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
      header: 'PATENTE',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.licensePlate,
    },
    {
      columnDef: 'model',
      header: 'MODELO',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.model,
    },
    {
      columnDef: 'kmTraveled',
      header: 'KILOMETRAJE',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.kmTraveled.toString(),
    },
    {
      columnDef: 'admissionDate',
      header: 'FECHA DE INGRESO',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.admissionDate.toString(),
    },
    {
      columnDef: 'enabled',
      header: 'ESTADO',
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
            // Implement delete action here
            console.log('Edit vehicle:', element);
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

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
