import { TableComponent, TableColumn, ColumnTypeEnum } from '@Common-UI';

import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
        this.decimalPipe.transform(element.kmInterval, '1.0-0')! + ' km',
    },
    {
      columnDef: 'timeInterval',
      header: 'Intervalo tiempo',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) =>
        element.timeInterval.toString(),
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Realizar',
          action: (element: MaintenancePlanListItem) =>
            console.log('Realizar', element),
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

  dataSource$ = new BehaviorSubject<MaintenancePlanListItem[]>([]);
  itemsNumber: number = 0;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;

  constructor(private readonly decimalPipe: DecimalPipe) {}

  ngOnInit(): void {}

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
