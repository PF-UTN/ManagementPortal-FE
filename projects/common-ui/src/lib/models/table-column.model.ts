import { PillStatus } from '../components';
import { ColumnType } from './column-types.model';
import { TableColumnAction } from './table-column-action.model';
export interface TableColumn<T> {
  columnDef: string;
  header: string;
  type: ColumnType;
  value?: (element: T) => string;
  multiValue?: (element: T) => string[];
  pillStatus?: (element: T) => PillStatus;
  actions?: TableColumnAction<T>[];
  width?: string;
  disabled?: (element: T) => boolean;
}
