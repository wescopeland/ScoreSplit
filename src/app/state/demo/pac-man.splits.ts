import { Split } from "../models/split.model";

export const pacManSplits: Split[] = [
  {
    label: "Screen 1"
  },
  {
    label: "Screen 2"
  },
  {
    isRepeating: true,
    labelMask: "Screen $",
    startAt: 3,
    endAt: 7
  },
  {
    label: "Screen 8"
  }
];
