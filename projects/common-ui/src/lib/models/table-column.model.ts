import { ColumnType } from "./column-types.model";
export interface TableColumn<T> {
    columnDef: string;
    header: string;
    type: ColumnType;
    value?: (element: T) => string;
    multiValue?: (element: T) => string[];
    action?: (element: T, actionType: string) => void;
}