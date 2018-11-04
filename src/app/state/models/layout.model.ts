export enum LayoutElement {
  Title,
  SplitsList,
  SumOfBest,
  ManualInput,
  GameVisionInput,
  Deaths,
  Bonuses,
  Pace
}

export interface Layout {
  elements: LayoutElement[];
}
