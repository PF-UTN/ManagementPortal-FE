import {
  ButtonComponent,
  ColumnTypeEnum,
  InputComponent,
  LateralDrawerService,
  TableColumn,
  TableComponent,
} from '@Common-UI';

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
      value: (element: VehicleListItem) => element.kmTraveled.toString(),
    },
    {
      columnDef: 'admissionDate',
      header: 'Fecha de ingreso',
      type: ColumnTypeEnum.VALUE,
      value: (element: VehicleListItem) => element.admissionDate.toString(),
    },
    {
      columnDef: 'enabled',
      header: 'Estado (Habilitado / No habilitado)',
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
          description: 'Editar',
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
    console.log('entre al al onClear Search');
    this.searchText = '';
    this.onSearchTextChange();
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.doSearchSubject$.next();
  }
}
