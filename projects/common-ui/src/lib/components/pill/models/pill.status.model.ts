export type PillStatus =
  | 'initial'
  | 'inprogress'
  | 'warning'
  | 'done'
  | 'cancelled';

export enum PillStatusEnum {
  Initial = 'initial',
  InProgress = 'inprogress',
  Warning = 'warning',
  Done = 'done',
  Cancelled = 'cancelled',
}
