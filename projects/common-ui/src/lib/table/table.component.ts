import {OnInit, Output, Input, EventEmitter, Component, ViewChild} from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TableColumn } from '../models/table-column.model';

@Component({
  selector: 'mp-table',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})

export class TableComponent<T> implements OnInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() dataSource: T[] = [];
  @Input() getRowClass: (row: T) => string = () => '';
  @Input() itemsNumber: number = 0;
  @Input() pageIndex: number = 0;
  @Input() pageSize: number = 0;
  @Output() pageChange = new EventEmitter<{ pageIndex: number, pageSize: number }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private paginatorIntl: MatPaginatorIntl) {
    this.paginatorIntl.itemsPerPageLabel = "Registros por página";
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => `${page * pageSize + 1} – ${Math.min((page + 1) * pageSize, length)} de ${length}`;
  }

  tableDataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ngOnInit() {
    this.displayedColumns = this.columns.map(c => c.columnDef);
    this.tableDataSource.data = this.dataSource;
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
  }

  onActionClick(row: T, action?: (element: T) => void) {
    if (action) {
      action(row);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  goToFirstPage() {
    this.paginator.firstPage();
  }
}
