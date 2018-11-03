import { Split } from "./split.model";
import { Run } from "./run.model";

export interface SplitArchive {
  title: string;
  category: string;
  runs: Run[];
  splits: Split[];
  attemptCount: number;
}
