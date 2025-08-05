import { CommonModule } from '@angular/common';
import {
  OnInit,
  Output,
  Input,
  EventEmitter,
  Component,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

import { ColumnTypeEnum } from '../../constants';
import { TableColumn } from '../../models/table-column.model';
import { LoadingComponent } from '../loading/loading.component';
import { PillComponent } from '../pill';

@Component({
  selector: 'mp-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatPaginatorModule,
    LoadingComponent,
    PillComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T> implements OnInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() dataSource$: Observable<T[]>;
  @Input() getRowClass: (row: T) => string = () => '';
  @Input() isActionDisabled: (element: T) => boolean = () => false;
  @Input() noDataMessage: string = 'No hay datos disponibles';
  @Input() isLoading: boolean = false;
  @Input() itemsNumber: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Output() pageChange = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();
  @Output() actionClicked = new EventEmitter<{ action: string; row: T }>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private paginatorIntl: MatPaginatorIntl) {
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
    this.paginatorIntl.getRangeLabel = (page, pageSize, length) =>
      `${page * pageSize + 1} – ${Math.min((page + 1) * pageSize, length)} de ${length}`;
  }

  tableDataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ROW_TYPES = ColumnTypeEnum;

  ngOnInit() {
    this.displayedColumns = this.columns.map((c) => c.columnDef);
    this.dataSource$.subscribe((data) => {
      this.tableDataSource.data = data || [];
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
  }

  onActionClick(action: string, row: T) {
    this.actionClicked.emit({ action, row });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
