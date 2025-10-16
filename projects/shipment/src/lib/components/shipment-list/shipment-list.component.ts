import {
  VehicleService,
  VehicleListItem,
  downloadFileFromResponse,
} from '@Common';
import {
  TitleComponent,
  InputComponent,
  ButtonComponent,
  ColumnTypeEnum,
  TableColumn,
  TableComponent,
  LateralDrawerService,
  ModalComponent,
} from '@Common-UI';

import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
} from 'rxjs/operators';

import { ShipmentItem } from '../../models/shipment-item.model';
import { ShipmentSearchRequest } from '../../models/shipment-search.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';
import { ShipmentDetailDrawerComponent } from '../shipment-detail-drawer/shipment-detail-drawer.component';

@Component({
  selector: 'mp-shipment-list',
  standalone: true,
  imports: [
    TitleComponent,
    CommonModule,
    InputComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    ButtonComponent,
    TableComponent,
    MatButtonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  templateUrl: './shipment-list.component.html',
  styleUrl: './shipment-list.component.scss',
})
export class ShipmentListComponent implements OnInit {
  columns: TableColumn<ShipmentItem>[] = [
    {
      columnDef: 'id',
      header: 'NÚMERO DE ENVÍO',
      type: ColumnTypeEnum.VALUE,
      value: (element: ShipmentItem) => element.id.toString(),
    },
    {
      columnDef: 'vehicleAssigned',
      header: 'VEHÍCULO ASIGNADO',
      type: ColumnTypeEnum.VALUE,
      value: (element: ShipmentItem) => element.vehicleAssigned,
    },
    {
      columnDef: 'shipmentStatus',
      header: 'ESTADO DEL ENVÍO',
      type: ColumnTypeEnum.VALUE,
      value: (element: ShipmentItem) => element.shipmentStatus,
    },
    {
      columnDef: 'date',
      header: 'FECHA DE ENVÍO',
      type: ColumnTypeEnum.VALUE,
      value: (element: ShipmentItem) =>
        this.datePipe.transform(element.date, 'dd/MM/yyyy')!,
    },
    {
      columnDef: 'actions',
      header: 'ACCIONES',
      type: ColumnTypeEnum.ACTIONS,
      actions: [
        {
          description: 'Ver Detalle',
          action: (element: ShipmentItem) => this.onDetailDrawer(element),
        },
        {
          description: 'Enviar',
          action: (element: ShipmentItem) => this.onSend(element),
          disabled: (element: ShipmentItem) =>
            element.shipmentStatus !== ShipmentStatusOptions.Pending,
        },
        {
          description: 'Finalizar',
          action: (element: ShipmentItem) => this.onFinish(element),
        },
      ],
    },
  ];

  vehicleControl = new FormControl<string | VehicleListItem>('');
  doSearchSubject$ = new Subject<void>();
  dataSource$ = new BehaviorSubject<ShipmentItem[]>([]);

  vehicleOptions: VehicleListItem[] = [];
  filteredVehicles: VehicleListItem[] = [];
  selectedVehicle: VehicleListItem | null = null;
  selectedStatus: string[] = [];
  statusOptions = statusOptions;

  isLoading = signal(false);

  vehicleSearchText: string = '';
  searchText: string = '';
  pageIndex: number = 0;
  pageSize: number = 10;
  itemsNumber: number = 0;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  private searchParams$ = new Subject<ShipmentSearchRequest>();

  constructor(
    private readonly datePipe: DatePipe,
    private readonly shipmentService: ShipmentService,
    private readonly vehicleService: VehicleService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.searchParams$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((params) => {
          this.isLoading.set(true);
          return this.shipmentService.searchShipments(params);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dataSource$.next(
            response.results.map((item) => ({
              id: item.id,
              vehicleAssigned: item.vehicle.licensePlate,
              shipmentStatus:
                item.status === 'Pendiente'
                  ? ShipmentStatusOptions.Pending
                  : item.status === 'Enviado'
                    ? ShipmentStatusOptions.Shipped
                    : item.status === 'Finalizado'
                      ? ShipmentStatusOptions.Finished
                      : ShipmentStatusOptions.Pending,
              date: item.date,
            })),
          );
          this.itemsNumber = response.total;
          this.isLoading.set(false);
        },
        error: () => {
          this.dataSource$.next([]);
          this.itemsNumber = 0;
          this.isLoading.set(false);
        },
      });

    this.vehicleService
      .postSearchVehiclesAsync({
        page: 1,
        pageSize: 10,
        searchText: '',
      })
      .subscribe((response) => {
        this.vehicleOptions = response.results;
        this.filteredVehicles = response.results;
      });

    this.vehicleControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const text =
            typeof value === 'string' ? value : (value?.licensePlate ?? '');
          const safeText = text.length > 50 ? text.substring(0, 50) : text;
          return this.vehicleService
            .postSearchVehiclesAsync({
              page: 1,
              pageSize: 10,
              searchText: safeText,
            })
            .pipe(map((response) => ({ response, value })));
        }),
      )
      .subscribe(({ response, value }) => {
        this.filteredVehicles = response.results;
        if (typeof value !== 'string' && value) {
          this.selectedVehicle = value;
          this.pageIndex = 0;
          this.emitSearch();
        }
        if (!value) {
          this.selectedVehicle = null;
          this.filteredVehicles = this.vehicleOptions;
          this.pageIndex = 0;
          this.emitSearch();
        }
      });
    this.emitSearch();
  }

  emitSearch(): void {
    this.searchParams$.next(this.getSearchRequest());
  }

  displayVehicle(vehicle: VehicleListItem | null): string {
    return vehicle ? `${vehicle.licensePlate}` : '';
  }

  onVehicleSearchChange(): void {
    const text = this.vehicleSearchText.trim();
    const safeText = text.length > 50 ? text.substring(0, 50) : text;
    this.vehicleService
      .postSearchVehiclesAsync({
        page: 1,
        pageSize: 10,
        searchText: safeText,
      })
      .subscribe((response) => {
        this.filteredVehicles = response.results;
      });
  }

  onVehicleSelected(vehicle: VehicleListItem): void {
    this.selectedVehicle = vehicle;
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  clearVehicleSelection(): void {
    this.vehicleControl.setValue('');
    this.selectedVehicle = null;
    this.filteredVehicles = this.vehicleOptions;
    this.pageIndex = 0;
    this.doSearchSubject$.next();
  }

  getSearchRequest(): ShipmentSearchRequest {
    let searchText = this.searchText ?? '';
    if (typeof searchText !== 'string') {
      searchText = '';
    }
    if (searchText.length > 50) {
      searchText = searchText.substring(0, 50);
    }

    const statusMap: Record<string, string> = {
      Pendiente: 'Pending',
      Enviada: 'Shipped',
      Finalizado: 'Finished',
    };

    return {
      searchText,
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      filters: {
        statusName: this.selectedStatus.map((s) => statusMap[s] ?? s),
        fromDate: this.fromDate
          ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? undefined)
          : undefined,
        toDate: this.toDate
          ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? undefined)
          : undefined,
        vehicleId: this.selectedVehicle?.id,
      },
    };
  }

  get isDateRangeValid(): boolean {
    return !this.fromDate || !this.toDate || this.fromDate <= this.toDate;
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.emitSearch();
  }

  onDetailDrawer(element: ShipmentItem): void {
    this.lateralDrawerService.open(
      ShipmentDetailDrawerComponent,
      { shipmentId: element.id },
      {
        title: `Detalle de Envío #${element.id}`,
        footer: {
          firstButton: {
            text: 'Cerrar',
            click: () => this.lateralDrawerService.close(),
          },
        },
        size: 'small',
      },
    );
  }

  onSend(element: ShipmentItem): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Confirmar envío',
        message: '¿Está seguro de que desea realizar este envío?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isLoading.set(true);
        this.shipmentService.sendShipment(element.id).subscribe({
          next: () => {
            this.snackBar.open('Envío realizado con éxito', 'Cerrar', {
              duration: 3000,
            });
            this.emitSearch();
            this.onDetailDrawer(element);
            this.isLoading.set(false);
          },
          error: () => {},
        });
      }
    });
  }

  onFinish(element: ShipmentItem): void {
    console.log(element);
  }

  onApplyDateFilter(): void {
    this.pageIndex = 0;
    this.emitSearch();
  }

  onSearchTextChange(): void {
    this.pageIndex = 0;
    this.isLoading.set(true);
    this.emitSearch();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.emitSearch();
  }

  onClearDateFilter(): void {
    this.fromDate = null;
    this.toDate = null;
    this.pageIndex = 0;
    this.emitSearch();
  }

  handleDownloadClick(): void {
    const params = this.getSearchRequest();
    this.shipmentService.downloadShipments(params).subscribe((response) => {
      downloadFileFromResponse(response, 'envios.xlsx');
    });
  }
}
