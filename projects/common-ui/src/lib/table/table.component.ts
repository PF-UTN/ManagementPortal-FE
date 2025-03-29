import {OnInit, Output, Input, EventEmitter, Component} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TableColumn } from '../models/table-column.model';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'mp-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})

export class TableComponent<T> implements OnInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() dataSource!: Observable<T[]>;
  @Input() getRowClass: (row: T) => string = () => '';
  @Output() actionClicked = new EventEmitter<{ action: string, row: T }>();
  @Input() customActionsTemplate!: TemplateRef<{ $implicit: T }>;

  tableDataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ngOnInit() {
  this.displayedColumns = this.columns.map(c => c.columnDef);

  if (this.dataSource) {
    this.dataSource.subscribe({
      next: (data) => {
        this.tableDataSource.data = data || [];
      },
      error: (err) => {
        console.error('Error al suscribirse a dataSource:', err);
      }
    });
  } else {
    console.error('dataSource is undefined or not an observable.');
  }
}

  onActionClick(action: string, row: T) {
    this.actionClicked.emit({ action, row });
  }
  
}
