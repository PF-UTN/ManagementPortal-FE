import { ColumnTypeEnum } from '../constants/column-types.constant';

export type ColumnType =
  | ColumnTypeEnum.VALUE
  | ColumnTypeEnum.MULTI_VALUE
  | ColumnTypeEnum.ACTIONS
  | ColumnTypeEnum.PILL;
