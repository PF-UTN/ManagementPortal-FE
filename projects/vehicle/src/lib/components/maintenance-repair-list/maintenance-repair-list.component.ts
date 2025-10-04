import {
  InputComponent,
  TableColumn,
  ColumnTypeEnum,
  TableComponent,
  ModalComponent,
  ModalConfig,
} from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { RepairItem } from '../../models/repair-item.model';

@Component({
  selector: 'mp-maintenance-repair-list',
  standalone: true,
  imports: [InputComponent, FormsModule, TableComponent],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './maintenance-repair-list.component.html',
  styleUrl: './maintenance-repair-list.component.scss',
})
export class MaintenanceRepairListComponent implements OnInit {
  columns: TableColumn<RepairItem>[] = [
    {
      columnDef: 'maintenanceDate',
      header: 'Fecha de reparación',
      type: ColumnTypeEnum.VALUE,
      value: (element: RepairItem) =>
        this.datePipe.transform(element.date, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'description',
      header: 'Descripcion',
      type: ColumnTypeEnum.VALUE,
      value: (element: RepairItem) => element.description,
    },
    {
      columnDef: 'repairKm',
      header: 'Kilometraje',
      type: ColumnTypeEnum.VALUE,
      value: (element: RepairItem) =>
        this.decimalPipe.transform(element.kmPerformed, '1.0-0')! + ' km',
    },
    {
      columnDef: 'actions',
      header: 'Acciones',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Modificar',
          action: (element: RepairItem) => {
            this.router.navigate(['../mantenimiento/editar-reparacion'], {
              relativeTo: this.route,
              state: {
                repair: {
                  ...element,
                  serviceSupplierId: element.serviceSupplierId,
                },
              },
            });
          },
        },
        {
          description: 'Eliminar',
          action: (element: RepairItem) =>
            this.deleteRepairWithConfirmation(element),
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
  dataSource$ = new BehaviorSubject<RepairItem[]>([]);
  doSearchSubject$ = new Subject<void>();

  constructor(
    private readonly datePipe: DatePipe,
    private readonly decimalPipe: DecimalPipe,
    private readonly vehicleService: VehicleService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
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
          const mappedResults: RepairItem[] = response.results.map((item) => ({
            id: item.id,
            date: item.date,
            description: item.description,
            kmPerformed: item.kmPerformed,
            serviceSupplierId: item.serviceSupplierId,
          }));
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

  deleteRepairWithConfirmation(repair: RepairItem): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: '¿Está seguro que desea eliminar esta reparación?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
      } as ModalConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = true;
      if (result) {
        this.vehicleService.deleteRepairAsync(repair.id).subscribe({
          next: () => {
            this.doSearchSubject$.next();
            this.snackBar.open('Reparación eliminada exitosamente', 'Cerrar', {
              duration: 3000,
            });
          },
          error: () => {},
        });
      }
    });
  }
}
