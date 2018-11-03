import { Component, Input, OnInit } from '@angular/core';

import { Bonus } from '../../state/models/bonus.model';

@Component({
  selector: 'ss-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss']
})
export class BonusesComponent implements OnInit {
  @Input('bonuses') bonuses: Bonus[];

  constructor() {}

  ngOnInit() {}

  getSumOfBonuses(bonuses: Bonus[]): number {
    let sum: number = 0;

    bonuses.forEach(bonus => {
      sum += bonus.diffValue;
    });

    return sum;
  }
}
