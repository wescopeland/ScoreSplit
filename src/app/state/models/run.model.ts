import { Death } from './death.model';
import { Bonus } from './bonus.model';

export interface Run {
  currentSplitId: number;
  splitFinishes: number[];
  likenesses: Array<{
    label: string;
    sum: number;
    count: number;
    ids: number[];
  }>;
  sumTable?: number[];
  deaths?: Death[];
  bonuses?: Bonus[];
}
