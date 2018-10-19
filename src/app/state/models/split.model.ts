export interface Split {
  label?: string;
  labelMask?: string;
  subsplits?: Split[];
  isRepeating?: boolean;
  startAt?: number;
  endAt?: number;
  likeness?: string;
}
