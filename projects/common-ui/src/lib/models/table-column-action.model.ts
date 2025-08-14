export interface TableColumnAction<T> {
  description: string;
  disabled?: (element: T) => boolean;
  action: (element: T) => void;
}
