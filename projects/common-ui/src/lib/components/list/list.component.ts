import { LoadingComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ListColumn } from '../../models/list-column.model';

@Component({
  selector: 'mp-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, LoadingComponent],
})
export class ListComponent<T> {
  @Input() columns: ListColumn<T>[] = [];
  @Input() items: T[] = [];
  @Input() noDataMessage = 'No hay datos disponibles';
  @Input() isLoading = false;

  get hasActions(): boolean {
    return this.columns.some((c) => c.actions);
  }

  get actionsColumn() {
    return this.columns.find((c) => c.actions);
  }
}
