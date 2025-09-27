import {
  TableComponent,
  TableColumn,
  ColumnTypeEnum,
  ModalComponent,
} from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { DecimalPipe } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MaintenanceItem } from '../../models/maintenance-item.model';
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
      columnDef: 'nextMaintenanceDate',
      header: 'Próxima fecha',
      type: ColumnTypeEnum.VALUE,
      value: (
        element: MaintenancePlanListItem & { lastMaintenanceDate?: string },
      ) => {
        if (!element.lastMaintenanceDate || !element.timeInterval) return '-';
        const last = new Date(element.lastMaintenanceDate);
        last.setMonth(last.getMonth() + element.timeInterval);
        return last.toLocaleDateString();
      },
    },
    {
      columnDef: 'nextMaintenanceKm',
      header: 'Próximo KM',
      type: ColumnTypeEnum.VALUE,
      value: (
        element: MaintenancePlanListItem & { lastMaintenanceKm?: number },
      ) => {
        if (element.lastMaintenanceKm == null || element.kmInterval == null)
          return '-';
        return element.lastMaintenanceKm + element.kmInterval + ' km';
      },
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
          action: (element: MaintenancePlanListItem) => {
            this.router.navigate(['crear-plan-mantenimiento'], {
              relativeTo: this.route,
              state: { plan: element },
            });
          },
        },
        {
          description: 'Eliminar',
          action: (element: MaintenancePlanListItem) =>
            this.deleteMaintenancePlanItem(element),
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

  maintenances: MaintenanceItem[] = [];

  constructor(
    private readonly decimalPipe: DecimalPipe,
    private readonly vechicleService: VehicleService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  formatTimeInterval(timeInterval: number | null | undefined): string {
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
          this.vechicleService
            .postSearchMaintenanceVehicle(this.vehicleId(), params)
            .subscribe({
              next: (maintResponse: { results: MaintenanceItem[] }) => {
                this.maintenances = maintResponse.results;
                const plansWithExtras = response.results.map((plan) => {
                  const last = this.maintenances
                    .filter((m) => m.description === plan.description)
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )[0];
                  return {
                    ...plan,
                    lastMaintenanceDate: last?.date,
                    lastMaintenanceKm: last?.kmPerformed,
                  };
                });
                this.dataSource$.next(plansWithExtras);
                this.itemsNumber = response.total;
                this.isLoading = false;
              },
              error: () => {
                this.dataSource$.next([]);
                this.itemsNumber = 0;
                this.isLoading = false;
              },
            });
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

  deleteMaintenancePlanItem(item: MaintenancePlanListItem): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Eliminar ítem',
        message:
          '¿Está seguro que desea eliminar este ítem del plan de mantenimiento?',
        cancelText: 'Cancelar',
        confirmText: 'Aceptar',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isLoading = true;
        this.vechicleService.deleteMaintenancePlanItem(item.id).subscribe({
          next: () => {
            this.ngOnInit();
            this.snackBar.open(
              'Mantenimiento eliminado exitosamente',
              'Cerrar',
              { duration: 3000 },
            );
          },
          error: (err) => {
            this.isLoading = false;
            let message = 'Ocurrió un error al eliminar el mantenimiento.';
            if (
              err?.error?.message?.includes(
                'is being used in a Maintenance and cannot be deleted',
              )
            ) {
              message =
                'No se puede eliminar el ítem porque ya fue utilizado en un mantenimiento.';
            }
            this.snackBar.open(message, 'Cerrar', { duration: 4000 });
          },
        });
      }
    });
  }
}
