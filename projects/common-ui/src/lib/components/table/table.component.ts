import { CommonModule } from '@angular/common';
import {
  OnInit,
  Output,
  Input,
  EventEmitter,
  Component,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { EllipsisTextComponent } from '../ellipsis-text/ellipsis-text.component';
import { LoadingComponent } from '../loading/loading.component';
import { PillComponent } from '../pill';

function hasSelectedProp(obj: unknown): obj is { selected: boolean } {
  return typeof obj === 'object' && obj !== null && 'selected' in obj;
}

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
    EllipsisTextComponent,
    MatCheckboxModule,
    FormsModule,
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
  @Output() selectedRows = new EventEmitter<T[]>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private readonly paginatorIntl: MatPaginatorIntl) {
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
    this.paginatorIntl.getRangeLabel = (page, pageSize, length) =>
      `${page * pageSize + 1} – ${Math.min((page + 1) * pageSize, length)} de ${length}`;
  }

  tableDataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];
  selectedRowsList: T[] = [];

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

  onRowSelect(row: T) {
    if (hasSelectedProp(row) && row.selected) {
      if (!this.selectedRowsList.includes(row)) {
        this.selectedRowsList.push(row);
      }
    } else {
      this.selectedRowsList = this.selectedRowsList.filter((r) => r !== row);
    }
    this.selectedRows.emit(this.selectedRowsList);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
