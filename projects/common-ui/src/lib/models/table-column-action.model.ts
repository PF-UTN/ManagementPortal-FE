export interface TableColumnAction<T> {
    description: string;
    action: (element: T) => void;
}
