import {
  TableComponent,
  TableColumn,
  ColumnTypeEnum,
  InputComponent,
} from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { MaintenanceListItem } from '../../models/maintenance-item.model';

@Component({
  selector: 'mp-maintenance-list',
  standalone: true,
  imports: [TableComponent, InputComponent, FormsModule],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './maintenance-list.component.html',
  styleUrl: './maintenance-list.component.scss',
})
export class MaintenanceListComponent implements OnInit {
  @Input() vehicleId!: number;

  columns: TableColumn<MaintenanceListItem>[] = [
    {
      columnDef: 'maintenanceDate',
      header: 'Fecha de mantenimiento',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceListItem) =>
        this.datePipe.transform(element.maintenanceDate, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'description',
      header: 'Descripcion',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceListItem) => element.description,
    },
    {
      columnDef: 'maintenanceKm',
      header: 'Kilometraje',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceListItem) =>
        this.decimalPipe.transform(element.maintenanceKm, '1.0-0')! + ' km',
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Modificar',
          action: (element: MaintenanceListItem) =>
            console.log('Modificar', element),
        },
        {
          description: 'Eliminnar',
          action: (element: MaintenanceListItem) =>
            console.log('Eliminar', element),
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<MaintenanceListItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  doSearchSubject$ = new Subject<void>();
  searchText: string = '';

  constructor(
    private readonly datePipe: DatePipe,
    private readonly decimalPipe: DecimalPipe,
    private readonly vehicleService: VehicleService,
  ) {}

  ngOnInit(): void {
    this.doSearchSubject$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => {
          const params = {
            searchText: this.searchText,
            page: this.pageIndex + 1,
            pageSize: this.pageSize,
          };
          return this.vehicleService.postSearchMaintenanceVehicle(
            this.vehicleId,
            params,
          );
        }),
      )
      .subscribe({
        next: (response) => {
          const mappedResults: MaintenanceListItem[] = response.results.map(
            (item) => ({
              maintenanceDate: item.date,
              description: item.description,
              maintenanceKm: item.kmPerformed,
            }),
          );
          this.dataSource$.next(mappedResults);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: () => {
          this.dataSource$.next([]);
          this.itemsNumber = 0;
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

  onClearSearch() {
    this.searchText = '';
    this.onSearchTextChange();
  }

  onSearchTextChange(): void {
    this.pageIndex = 0;
    this.isLoading = true;
    this.doSearchSubject$.next();
  }
}
