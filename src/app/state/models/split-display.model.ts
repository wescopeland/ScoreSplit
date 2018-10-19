export interface SplitDisplay {
  id: number;
  isAlternating: boolean;
  isCurrent: boolean;
  isDone: boolean;
  isSubsplit: boolean;
  repeatGroup?: number;
  likeness?: string;
  mainLabel: string;
  columnOneValue?: string;
  columnTwoValue?: string;
  subsplits?: SplitDisplay[];
}
