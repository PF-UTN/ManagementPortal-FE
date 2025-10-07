import { VehicleService } from '@Common';
import {
  TableComponent,
  TableColumn,
  ColumnTypeEnum,
  ModalComponent,
} from '@Common-UI';

import { DecimalPipe } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MaintenanceItem } from '../../../../../common/src/models/vehicle/maintenance-item.model';
import { MaintenancePlanListItem } from '../../../../../common/src/models/vehicle/maintenance-plan.model';

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
      header: 'DESCRIPCIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) => element.description,
    },
    {
      columnDef: 'nextMaintenanceDate',
      header: 'PRÓXIMA FECHA',
      type: ColumnTypeEnum.VALUE,
      value: (
        element: MaintenancePlanListItem & { lastMaintenanceDate?: string },
      ) => {
        if (!element.lastMaintenanceDate || !element.timeInterval) return '-';
        const last = new Date(element.lastMaintenanceDate);
        last.setMonth(last.getMonth() + element.timeInterval);
        return last.toLocaleDateString('es-AR');
      },
    },
    {
      columnDef: 'nextMaintenanceKm',
      header: 'PRÓXIMO KM',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) => {
        const e = element as MaintenancePlanListItem & {
          lastMaintenanceKm?: number;
          currentKm?: number;
        };
        if (e.kmInterval == null) return '-';
        let value: number | null = null;
        if (e.lastMaintenanceKm != null) {
          value = e.lastMaintenanceKm + e.kmInterval;
        } else if (e.currentKm != null) {
          value = e.currentKm + e.kmInterval;
        }
        if (value != null) {
          return this.decimalPipe.transform(value, '1.0-0') + ' km';
        }
        return '-';
      },
    },
    {
      columnDef: 'kmInterval',
      header: 'INTERVALO KM',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) =>
        element.kmInterval == null
          ? '-'
          : this.decimalPipe.transform(element.kmInterval, '1.0-0')! + ' km',
    },
    {
      columnDef: 'timeInterval',
      header: 'INTERVALO TIEMPO',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenancePlanListItem) =>
        this.formatTimeInterval(element.timeInterval),
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
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
    const vehicleId = this.vehicleId();
    this.isLoading = true;
    const params = {
      searchText: '',
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
    };
    this.vechicleService.getVehicleById(vehicleId).subscribe({
      next: (vehicle) => {
        const currentKm = vehicle.kmTraveled;
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
                      const maints = this.maintenances.filter(
                        (m) => m.description === plan.description,
                      );
                      const lastKm = maints.length
                        ? Math.max(...maints.map((m) => m.kmPerformed ?? 0))
                        : null;
                      const lastDate = maints.length
                        ? maints.sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime(),
                          )[0]?.date
                        : null;
                      return {
                        ...plan,
                        lastMaintenanceDate: lastDate,
                        lastMaintenanceKm: lastKm,
                        currentKm,
                      };
                    });
                    this.dataSource$.next(plansWithExtras);
                    this.itemsNumber = response.total;
                    this.isLoading = false;
                  },
                  error: () => {
                    this.handleLoadError();
                  },
                });
            },
            error: () => {
              this.handleLoadError();
            },
          });
      },
      error: () => {
        this.handleLoadError();
      },
    });
  }

  private handleLoadError(): void {
    this.dataSource$.next([]);
    this.itemsNumber = 0;
    this.isLoading = false;
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
