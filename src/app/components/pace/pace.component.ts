import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Run } from '../../state/models/run.model';
import { Death } from '../../state/models/death.model';
import { SplitDisplay } from '../../state/models/split-display.model';

import { ScoresplitStateService } from '../../state/service/state.service';

@Component({
  selector: 'ss-pace',
  templateUrl: './pace.component.html',
  styleUrls: ['./pace.component.scss']
})
export class PaceComponent implements OnInit, OnChanges {
  @Input('current-run') currentRun: Run;
  @Input('split-displays') splitDisplays: SplitDisplay[];

  public currentPace: number;

  constructor(private _state: ScoresplitStateService) {}

  ngOnInit() {}

  ngOnChanges(e) {
    this.currentPace = this.getCurrentPace(this.currentRun, this.splitDisplays);
  }

  deriveAverageFromLikenesses(
    likenesses: Array<{
      label: string;
      sum: number;
      count: number;
      ids: number[];
    }>,
    subsplitGroups: number[][],
    splitDisplays: SplitDisplay[]
  ): number {
    let average: number = 0;

    // Get the number of times a likeness appears in a sequence.
    let appearances: any = {};

    let repeatGroupIndex = null;
    splitDisplays.forEach((splitDisplay, index) => {
      if (splitDisplay.repeatGroup !== null && splitDisplay.repeatGroup !== undefined) {
        repeatGroupIndex = index;
      }
    });

    if (repeatGroupIndex) {
      splitDisplays[repeatGroupIndex].subsplits.forEach(subsplit => {
        if (appearances[subsplit.likeness]) {
          appearances[subsplit.likeness] += 1;
        } else {
          appearances[subsplit.likeness] = 1;
        }
      });
    }

    likenesses.forEach(likeness => {
      average +=
        (likeness.sum / likeness.count) * subsplitGroups.length * appearances[likeness.label];
    });

    return average;
  }

  getSubsplitAverage(subsplitScores: number[][]): number {
    let averageValue = null;

    let groupCount = subsplitScores.length;
    let subsplitsPerGroup = subsplitScores[0] && subsplitScores[0].length;
    let averageSubsplit: number[] = [];

    // At least one subsplit group must be finished.
    if (!subsplitScores[0] || !subsplitScores[0][subsplitsPerGroup - 1]) {
      return averageValue;
    }

    // Get the average of each subsplit node.
    let sumObjects: any[] = new Array(subsplitsPerGroup);
    for (let i = 0; i < subsplitScores.length; i += 1) {
      for (let j = 0; j < subsplitsPerGroup; j += 1) {
        if (subsplitScores[i][j]) {
          if (!sumObjects[j]) {
            sumObjects[j] = {
              sum: subsplitScores[i][j],
              count: 1
            };
          } else {
            sumObjects[j].sum += subsplitScores[i][j];
            sumObjects[j].count += 1;
          }
        }
      }
    }

    // Reduce averages into an array of numbers.
    sumObjects.forEach(sumObject => {
      averageSubsplit.push(sumObject.sum / sumObject.count);
    });

    // Sum up the average and multiply it by the repeat count.
    let totalSum;
    averageSubsplit.forEach(average => {
      if (!totalSum) {
        totalSum = average;
      } else {
        totalSum += average;
      }
    });

    averageValue = totalSum * groupCount;

    return averageValue;
  }

  getScoresOfSubsplitGroups(subsplitGroups: number[][], currentRun: Run): number[][] {
    let allGroupScores: number[][] = [];

    subsplitGroups.forEach(group => {
      let groupScores = [];
      group.forEach(id => {
        groupScores.push(currentRun.splitFinishes[id]);
      });

      allGroupScores.push(groupScores);
    });

    return allGroupScores;
  }

  getSumOfNonRepeatingSplits(splitIds: number[], currentRun: Run): number {
    let sum = 0;

    splitIds.forEach(id => {
      if (currentRun.splitFinishes[id]) {
        sum += currentRun.splitFinishes[id];
      }
    });

    return sum;
  }

  getSumOfDeaths(deaths: Death[]): number {
    let sum = 0;

    deaths.forEach(death => {
      sum += death.diffValue;
    });

    return sum;
  }

  getCurrentPace(currentRun: Run, splitDisplays: SplitDisplay[]): number {
    let pace: number;

    let nonRepeatingSum = this.getSumOfNonRepeatingSplits(
      this._state.getIdsOfNonRepeatingSplits(splitDisplays),
      currentRun
    );

    let deathsSum = this.getSumOfDeaths(currentRun.deaths);

    let repeatGroups = this._state.getIdsOfRepeatingSplits(splitDisplays);
    let averageSets: number[] = [];
    let rawSubsplitScores: any;
    repeatGroups.forEach((group, groupId) => {
      let subsplitGroups = this._state.getAllSubsplitGroupsByGroupId(groupId, splitDisplays);

      rawSubsplitScores = this.getScoresOfSubsplitGroups(subsplitGroups, currentRun);

      averageSets.push(this.getSubsplitAverage(rawSubsplitScores));
    });

    // If there are repeat groups, one set must be
    // completed to calculate pace.
    let hasAllSets = true;
    averageSets.forEach(set => {
      if (!set) {
        hasAllSets = false;
      }
    });

    if (repeatGroups && !hasAllSets) {
      return pace;
    }

    /*
     * Pace is equal to:
     * non-repeating splits + (repeating splits / count) + deaths.
     * Right now we only support one set of repeating splits.
     */

    let averageSum = 0;
    if (repeatGroups && averageSets) {
      averageSets.forEach(averageSet => {
        averageSum += averageSet;
      });

      // Are there likenesses?
      if (currentRun.likenesses && currentRun.likenesses.length) {
        let likenessesAverageSum = this.deriveAverageFromLikenesses(
          currentRun.likenesses,
          rawSubsplitScores,
          this.splitDisplays
        );

        pace = nonRepeatingSum + likenessesAverageSum + deathsSum;
      } else {
        pace = nonRepeatingSum + averageSum + deathsSum;
      }
    }

    if (!repeatGroups) {
      pace = nonRepeatingSum + deathsSum;
    }

    return Math.round(pace / 100) * 100;
  }
}
