import { Component, OnInit, Input } from '@angular/core';

export interface ColumnValue {
  value: number;
  color: string;
  hasDesignator: boolean;
}

@Component({
  selector: 'ss-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss']
})
export class SplitComponent implements OnInit {
  @Input('is-alternating') isAlternating: boolean;
  @Input('is-current') isCurrent: boolean;
  @Input('is-done') isDone: boolean;
  @Input('is-final') isFinal: boolean;
  @Input('is-subsplit') isSubsplit: boolean;
  @Input('main-label') mainLabel: string;
  @Input('current-maximum-value') currentMaximumValue: number;
  @Input('column-one-value') columnOneValue: ColumnValue;
  @Input('column-two-value') columnTwoValue: ColumnValue;
  @Input('column-three-value') columnThreeValue: ColumnValue;

  constructor() {}

  ngOnInit() {}

  getColorSymbol(color: string): string {
    let symbol;

    if (color === 'gold' || color.includes('green')) {
      symbol = '+';
    } else if (color.includes('red')) {
      symbol = '-';
    } else {
      symbol = null;
    }

    return symbol;
  }
}
