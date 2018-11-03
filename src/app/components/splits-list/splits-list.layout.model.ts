export enum SplitsListColumns {
  Sum,
  SplitValue,
  VsPB
}

export interface SplitsListLayout {
  columnOneValue: SplitsListColumns;
  columnTwoValue?: SplitsListColumns;
  columnThreeValue?: SplitsListColumns;
}
