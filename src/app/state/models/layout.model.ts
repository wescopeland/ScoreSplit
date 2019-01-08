export enum LayoutElement {
  Title,
  SplitsList,
  SumOfBest,
  ManualInput,
  GameVisionInput,
  Deaths,
  Bonuses,
  Pace,
  MostRecentSplitValue
}

export interface Layout {
  elements: Array<{ element: LayoutElement; options?: any }>;
}
