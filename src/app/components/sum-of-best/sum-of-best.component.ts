import { Component, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';

import { Run } from '../../state/models/run.model';
import { Death } from '../../state/models/death.model';
import { SplitArchive } from '../../state/models/split-archive.model';
import { SplitDisplay } from '../../state/models/split-display.model';

@Component({
  selector: 'ss-sum-of-best',
  templateUrl: './sum-of-best.component.html',
  styleUrls: ['./sum-of-best.component.scss']
})
export class SumOfBestComponent implements OnInit, OnChanges {
  @Input('current-run') currentRun: Run;
  @Input('current-split-archive') currentSplitArchive: SplitArchive;
  @Input('current-split-displays') currentSplitDisplays: SplitDisplay[];

  public sumOfBest: number = null;

  constructor() {}

  ngOnInit() {
    this.sumOfBest = this.calculateSumOfBest(
      this.currentSplitArchive,
      this.currentRun,
      this.currentSplitDisplays
    );
  }

  ngOnChanges(e: SimpleChanges) {
    this.sumOfBest = this.calculateSumOfBest(
      this.currentSplitArchive,
      this.currentRun,
      this.currentSplitDisplays
    );
  }

  calculateSumOfBest(
    splitArchive: SplitArchive,
    currentRun: Run,
    splitDisplays: SplitDisplay[]
  ): number {
    let sumOfBest = 0;
    let bestBonuses: number[] = [];
    let bestDeaths: number[] = [];
    let bestFinishes: number[];

    let maxBonusCount: number = 0;
    let maxLifeCount: number = 0;

    // Get the max number of lives used in a run.
    if (!maxLifeCount) {
      splitArchive.runs.forEach(run => {
        if (run.deaths && run.deaths.length && run.deaths.length > maxLifeCount) {
          maxLifeCount = run.deaths.length;
        }
      });

      if (
        currentRun.deaths &&
        currentRun.deaths.length &&
        currentRun.deaths.length > maxLifeCount
      ) {
        maxLifeCount = currentRun.deaths.length;
      }
    }

    // Get the max number of bonuses used in a run.
    if (!maxBonusCount) {
      splitArchive.runs.forEach(run => {
        if (run.bonuses && run.bonuses.length && run.bonuses.length > maxBonusCount) {
          maxBonusCount = run.bonuses.length;
        }
      });

      if (
        currentRun.bonuses &&
        currentRun.bonuses.length &&
        currentRun.bonuses.length > maxBonusCount
      ) {
        maxBonusCount = currentRun.bonuses.length;
      }
    }

    if (maxLifeCount !== null) {
      bestFinishes = [];

      // Get the highest scoring deaths in the archive.
      for (let i = 0; i < maxLifeCount; i += 1) {
        let currentBestDeath = 0;
        for (let j = 0; j < splitArchive.runs.length; j += 1) {
          if (
            splitArchive.runs[j].deaths &&
            splitArchive.runs[j].deaths.length &&
            splitArchive.runs[j].deaths[i] &&
            splitArchive.runs[j].deaths[i].diffValue > currentBestDeath
          ) {
            currentBestDeath = splitArchive.runs[j].deaths[i].diffValue;
          }
        }

        if (
          currentRun.deaths &&
          currentRun.deaths.length &&
          currentRun.deaths[i] &&
          currentRun.deaths[i].diffValue > currentBestDeath
        ) {
          currentBestDeath = currentRun.deaths[i].diffValue;
        }

        bestDeaths.push(currentBestDeath);
      }

      // Get the highest scoring bonuses in the archive.
      for (let i = 0; i < maxBonusCount; i += 1) {
        let currentBestBonus = 0;
        for (let j = 0; j < splitArchive.runs.length; j += 1) {
          if (
            splitArchive.runs[j].bonuses &&
            splitArchive.runs[j].bonuses.length &&
            splitArchive.runs[j].bonuses[i] &&
            splitArchive.runs[j].bonuses[i].diffValue > currentBestBonus
          ) {
            currentBestBonus = splitArchive.runs[j].bonuses[i].diffValue;
          }
        }

        if (
          currentRun.bonuses &&
          currentRun.bonuses.length &&
          currentRun.bonuses[i] &&
          currentRun.bonuses[i].diffValue > currentBestBonus
        ) {
          currentBestBonus = currentRun.bonuses[i].diffValue;
        }

        bestBonuses.push(currentBestBonus);
      }
    }

    // Find the best splits in the archive.
    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        splitDisplay.subsplits.forEach(subsplit => {
          let currentId = subsplit.id;
          let bestFinish = 0;

          // Get the best score for this split id.
          splitArchive.runs.forEach(run => {
            if (run.splitFinishes[currentId] > bestFinish) {
              bestFinish = run.splitFinishes[currentId];
            }

            if (currentRun.splitFinishes[currentId] > bestFinish) {
              bestFinish = currentRun.splitFinishes[currentId];
            }
          });

          if (!bestFinish && currentRun.splitFinishes[currentId]) {
            bestFinish = currentRun.splitFinishes[currentId];
          }

          bestFinishes.push(bestFinish);
        });
      } else {
        let currentId = splitDisplay.id;
        let bestFinish = 0;

        // Get the best score for this split id.
        splitArchive.runs.forEach(run => {
          if (run.splitFinishes[currentId] > bestFinish) {
            bestFinish = run.splitFinishes[currentId];
          }

          if (currentRun.splitFinishes[currentId] > bestFinish) {
            bestFinish = currentRun.splitFinishes[currentId];
          }
        });

        if (!bestFinish && currentRun.splitFinishes[currentId]) {
          bestFinish = currentRun.splitFinishes[currentId];
        }

        bestFinishes.push(bestFinish);
      }
    });

    bestFinishes.forEach(bestFinish => {
      sumOfBest += bestFinish;
    });

    if (bestDeaths.length) {
      bestDeaths.forEach(bestDeath => {
        sumOfBest += bestDeath;
      });
    }

    if (bestBonuses.length) {
      bestBonuses.forEach(bestBonus => {
        sumOfBest += bestBonus;
      });
    }

    return sumOfBest;
  }
}
