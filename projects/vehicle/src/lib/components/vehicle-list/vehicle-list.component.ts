import {
  ColumnTypeEnum,
  LateralDrawerService,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { VehicleListItem } from '../../models/vehicle-item.model';
import { VehicleParams } from '../../models/vehicle-params.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'mp-vehicle-list',
  standalone: true,
  imports: [TableComponent],
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
      columnDef: 'enabled',
      header: 'Habilitado',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => (element.enabled ? 'Sí' : 'No'),
    },
    {
      columnDef: 'kmTraveled',
      header: 'KM Recorridos',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.kmTraveled.toString(),
    },
    {
      columnDef: 'entryDate',
      header: 'Fecha de Ingreso',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) =>
        element.entryDate ? element.entryDate.toLocaleDateString() : '',
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
          description: 'Modificar',
          action: (element: VehicleListItem) => {
            // Implement edit action here
            console.log('Edit vehicle:', element);
          },
        },
        {
          description: 'Eliminar',
          action: (element: VehicleListItem) => {
            // Implement delete action here
            console.log('Delete vehicle:', element);
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

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly lateralDrawerService: LateralDrawerService,
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
            searchText: '',
          };
          return this.vehicleService.postSearchVehicles(params);
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

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
