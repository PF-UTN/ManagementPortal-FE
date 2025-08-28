import {
  InputComponent,
  TableColumn,
  ColumnTypeEnum,
  TableComponent,
} from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { MaintenanceRepairItem } from '../../models/maintenance-rapair-item.model';

@Component({
  selector: 'mp-maintenance-repair-list',
  standalone: true,
  imports: [InputComponent, FormsModule, TableComponent],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './maintenance-repair-list.component.html',
  styleUrl: './maintenance-repair-list.component.scss',
})
export class MaintenanceRepairListComponent implements OnInit {
  columns: TableColumn<MaintenanceRepairItem>[] = [
    {
      columnDef: 'maintenanceDate',
      header: 'Fecha de reparación',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceRepairItem) =>
        this.datePipe.transform(element.date, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'description',
      header: 'Descripcion',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceRepairItem) => element.description,
    },
    {
      columnDef: 'repairKm',
      header: 'Kilometraje',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceRepairItem) =>
        this.decimalPipe.transform(element.kmPerformed, '1.0-0')! + ' km',
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Modificar',
          action: (element: MaintenanceRepairItem) =>
            console.log('Modificar', element),
        },
        {
          description: 'Eliminar',
          action: (element: MaintenanceRepairItem) =>
            console.log('Eliminar', element),
        },
      ],
    },
  ];

  vehicleId = input.required<number>();
  searchText: string = '';
  itemsNumber: number = 0;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  dataSource$ = new BehaviorSubject<MaintenanceRepairItem[]>([]);
  doSearchSubject$ = new Subject<void>();

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
          return this.vehicleService.postSearchRepairVehicle(
            this.vehicleId(),
            params,
          );
        }),
      )
      .subscribe({
        next: (response) => {
          const mappedResults: MaintenanceRepairItem[] = response.results.map(
            (item) => ({
              date: item.date,
              description: item.description,
              kmPerformed: item.kmPerformed,
            }),
          );
          this.dataSource$.next(mappedResults);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: () => {
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

  onClearSearch(): void {
    this.searchText = '';
    this.onSearchTextChange();
  }

  onSearchTextChange(): void {
    this.pageIndex = 0;
    this.isLoading = true;
    this.doSearchSubject$.next();
  }
}
