import { TableComponent, TableColumn, ColumnTypeEnum } from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { DecimalPipe } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MaintenancePlanListItem } from '../../models/maintenance-plan.model';

@Component({
  selector: 'mp-maintenance-plan-list',
  standalone: true,
  imports: [TableComponent],
  providers: [DecimalPipe],
  templateUrl: './maintenance-plan-list.component.html',
  styleUrl: './maintenance-plan-list.component.scss',
})
export class MaintenancePlanListComponent implements OnInit {
  columns: TableColumn<MaintenancePlanListItem>[] = [
    {
      columnDef: 'description',
      header: 'Descripcion',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) => element.description,
    },
    {
      columnDef: 'kmInterval',
      header: 'Intervalo KM',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) =>
        element.kmInterval == null
          ? '-'
          : this.decimalPipe.transform(element.kmInterval, '1.0-0')! + ' km',
    },
    {
      columnDef: 'timeInterval',
      header: 'Intervalo tiempo',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) =>
        this.formatTimeInterval(element.timeInterval),
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Realizar',
          action: (element: MaintenancePlanListItem) => {
            this.router.navigate(['realizar', element.id], {
              relativeTo: this.route,
            });
          },
        },
        {
          description: 'Modificar',
          action: (element: MaintenancePlanListItem) =>
            console.log('Modificar', element),
        },
        {
          description: 'Eliminnar',
          action: (element: MaintenancePlanListItem) =>
            console.log('Eliminar', element),
        },
      ],
    },
  ];

  vehicleId = input.required<number>();
  dataSource$ = new BehaviorSubject<MaintenancePlanListItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;

  constructor(
    private readonly decimalPipe: DecimalPipe,
    private readonly vechicleService: VehicleService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  private formatTimeInterval(timeInterval: number | null | undefined): string {
    if (timeInterval == null || timeInterval === 0) {
      return '-';
    }
    return `${timeInterval} Meses`;
  }

  ngOnInit(): void {
    this.isLoading = true;
    const params = {
      searchText: '',
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
    };
    this.vechicleService
      .postSearchMaintenancePlanItemVehicle(this.vehicleId(), params)
      .subscribe({
        next: (response: {
          results: MaintenancePlanListItem[];
          total: number;
        }) => {
          this.dataSource$.next(response.results);
          this.itemsNumber = response.total;
          this.isLoading = false;
        },
        error: () => {
          this.dataSource$.next([]);
          this.itemsNumber = 0;
          this.isLoading = false;
        },
      });
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
