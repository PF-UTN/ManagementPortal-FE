import { OnInit, Output, Input, EventEmitter, Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableColumn } from '../../models/table-column.model';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list'; 
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ColumnTypeEnum } from '@common-ui';

@Component({
  selector: 'mp-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatMenuModule, MatIconModule, MatButtonModule, MatGridListModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})

export class TableComponent<T> implements OnInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() dataSource$: Observable<T[]>;
  @Input() getRowClass: (row: T) => string = () => '';
  @Input() noDataMessage: string = 'No hay datos disponibles';
  @Input() isLoading: boolean = false;
  @Input() itemsNumber: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() actionClicked = new EventEmitter<{ action: string, row: T }>();

  tableDataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ROW_TYPES = ColumnTypeEnum;

  ngOnInit() {
  this.displayedColumns = this.columns.map(c => c.columnDef);
  this.dataSource$.subscribe({
      next: (data) => {
        this.tableDataSource.data = data || [];
      },
    });
  } 

  onActionClick(action: string, row: T) {
    this.actionClicked.emit({ action, row });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageChange.emit(event);
  }
}
