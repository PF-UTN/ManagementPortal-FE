import { VehicleService } from '@Common';
import {
  TableComponent,
  TableColumn,
  ColumnTypeEnum,
  InputComponent,
  ModalComponent,
} from '@Common-UI';

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subject, switchMap, tap } from 'rxjs';

import { MaintenanceItem } from '../../../../../common/src/models/vehicle/maintenance-item.model';

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

  columns: TableColumn<MaintenanceItem>[] = [
    {
      columnDef: 'date',
      header: 'FECHA DE MANTENIMIENTO',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceItem) =>
        this.datePipe.transform(element.date, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'description',
      header: 'DESCRIPCIÓN',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceItem) => element.description,
    },
    {
      columnDef: 'kmPerformed',
      header: 'KILOMETRAJE',
      type: ColumnTypeEnum.VALUE,
      value: (element: MaintenanceItem) =>
        this.decimalPipe.transform(element.kmPerformed, '1.0-0')! + ' km',
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Editar',
          action: (element: MaintenanceItem) => {
            this.router.navigate(['realizar', element.id], {
              relativeTo: this.route,
              state: { maintenance: element },
            });
          },
        },
        {
          description: 'Eliminar',
          action: (element: MaintenanceItem) =>
            this.deleteMaintenanceItem(element),
        },
      ],
    },
  ];

  dataSource$ = new BehaviorSubject<MaintenanceItem[]>([]);
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
          return this.vehicleService.postSearchMaintenanceVehicle(
            this.vehicleId,
            params,
          );
        }),
      )
      .subscribe({
        next: (response) => {
          const mappedResults: MaintenanceItem[] = response.results.map(
            (item) => ({
              id: item.id,
              kmPerformed: item.kmPerformed,
              description: item.description,
              date: item.date,
              serviceSupplierId: item.serviceSupplierId,
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

  deleteMaintenanceItem(item: MaintenanceItem): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'ELIMINAR MANTENIMIENTO',
        message: '¿Está seguro que desea eliminar este mantenimiento?',
        cancelText: 'Cancelar',
        confirmText: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isLoading = true;
        this.vehicleService.deleteMaintenanceItem(item.id).subscribe({
          next: () => {
            this.ngOnInit();
            this.snackBar.open(
              'Mantenimiento eliminado exitosamente',
              'Cerrar',
              { duration: 3000 },
            );
          },
          error: () => {
            this.isLoading = false;
            this.snackBar.open(
              'Ocurrió un error al eliminar el mantenimiento.',
              'Cerrar',
              { duration: 4000 },
            );
          },
        });
      }
    });
  }
}
