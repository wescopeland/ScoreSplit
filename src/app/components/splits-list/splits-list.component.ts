import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { formatNumber } from '@angular/common';
import { Subscription } from 'rxjs';
import * as leftPad from 'left-pad';

import { ScoresplitMessengerService } from '../../messenger/messenger.service';
import { ScoresplitStateService } from '../../state/service/state.service';
import { Run } from '../../state/models/run.model';
import { Split } from '../../state/models/split.model';
import { SplitArchive } from '../../state/models/split-archive.model';
import { SplitDisplay } from '../../state/models/split-display.model';
import { Column } from '../../state/models/column.model';

@Component({
  selector: 'ss-splits-list',
  templateUrl: './splits-list.component.html',
  styleUrls: ['./splits-list.component.scss']
})
export class SplitsListComponent implements OnInit, OnChanges {
  @Input('columns') columns: Column[];
  @Input('current-run') currentRun: Run;
  @Input('current-split-archive') currentSplitArchive: SplitArchive;
  @Input('split-displays') splitDisplays: SplitDisplay[];

  public desiredVisibleSplits = 5;
  public finalSplit: SplitDisplay;
  public splitMaximums: number[] = [];
  public pbSplitSegmentValues: number[] = [];
  public pbSplitSumValues: number[] = [];
  public pbRun: Run;
  public visibleSplitIds = [];

  private _subscription: Subscription;

  constructor(
    private _state: ScoresplitStateService,
    private _messenger: ScoresplitMessengerService
  ) {}

  ngOnInit() {
    this.finalSplit = this.getFinalSplit(this.splitDisplays);
    this.splitMaximums = this.getSplitMaximums(this.currentSplitArchive.runs);
    this.pbRun = this.getPbRun(this.currentSplitArchive.runs);

    if (this.pbRun) {
      this.pbSplitSegmentValues = this.pbRun.splitFinishes;
      this.pbSplitSumValues = this.pbRun.sumTable;
    }
  }

  ngOnChanges(e: SimpleChanges) {
    setTimeout(() => {
      let element = document.getElementsByClassName('splits--split__current')[0];

      if (element) {
        let isActiveSplitVisible = this.getIfElementVisible(element);

        if (!isActiveSplitVisible) {
          this.incrementScroll();
        }
      }

      if (this.getIfHasSubsplits(this.splitDisplays)) {
        let finalSubsplitElement = document.getElementsByClassName('last-subsplit')[0];

        // Try three times to find it, then give up.
        if (!this.getIfElementVisible(finalSubsplitElement)) {
          this.incrementScroll();
        }

        if (!this.getIfElementVisible(finalSubsplitElement)) {
          this.incrementScroll();
        }

        if (!this.getIfElementVisible(finalSubsplitElement)) {
          this.incrementScroll();
        }
      }
    }, 0);

    if (e.currentSplitArchive && !e.currentSplitArchive.firstChange) {
      this.finalSplit = this.getFinalSplit(this.splitDisplays);
      this.splitMaximums = this.getSplitMaximums(this.currentSplitArchive.runs);
      this.pbRun = this.getPbRun(this.currentSplitArchive.runs);

      if (this.pbRun) {
        this.pbSplitSegmentValues = this.pbRun.splitFinishes;
        this.pbSplitSumValues = this.pbRun.sumTable;
      }
    }
  }

  getFinalSplit(splitDisplays: SplitDisplay[]): SplitDisplay {
    let finalSplit: SplitDisplay;

    let lastSplitDisplay = splitDisplays[splitDisplays.length - 1];

    // Is the last split a subsplit? That would be the one to show if that's the case.
    if (lastSplitDisplay.subsplits && lastSplitDisplay.subsplits.length) {
      return lastSplitDisplay.subsplits[lastSplitDisplay.subsplits.length - 1];
    } else {
      return lastSplitDisplay;
    }
  }

  getDeathPointsUpToSplitId(run: Run, splitId: number): number {
    let deathPoints = 0;

    run.deaths.forEach(death => {
      if (death.splitId <= splitId) {
        deathPoints += death.diffValue;
      }
    });

    return deathPoints;
  }

  getPercentDifference(numberA: number, numberB: number): number {
    return Math.abs(((numberA - numberB) / numberB) * 100);
  }

  getColumnHeaderLabel(column: Column): string {
    let label = '';

    if (column === Column.Sum) {
      return 'Total';
    } else if (column === Column.SplitValue) {
      return 'Segment';
    } else if (column === Column.VsPB) {
      return 'Vs PB';
    }

    return label;
  }

  getSplitDisplayBySplitId(id: number, splitDisplays: SplitDisplay[]): SplitDisplay {
    return this._state.getCurrentSplitDisplay(id, splitDisplays);
  }

  getParentBySubsplitId(id: number, splitDisplays: SplitDisplay[]): SplitDisplay {
    return this._state.getParentBySubsplitId(id, splitDisplays);
  }

  getIfFinalParentHasActiveSubsplits(splitDisplay: SplitDisplay, currentRun: Run): boolean {
    let isActive = false;

    if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
      splitDisplay.subsplits.forEach(subsplit => {
        if (subsplit.id <= currentRun.currentSplitId) {
          isActive = true;
        }
      });
    }

    return isActive;
  }

  getColumnValue(valueType: Column, currentRun: Run, splitId: number): any {
    let selectedSplit = this._state.getCurrentSplitDisplay(splitId, this.splitDisplays);
    let currentSplit = this._state.getCurrentSplitDisplay(
      currentRun.currentSplitId,
      this.splitDisplays
    );

    let isParentOfSubsplitActive = false;
    if (
      selectedSplit !== currentSplit &&
      selectedSplit ===
        this._state.getParentBySubsplitId(currentRun.currentSplitId, this.splitDisplays)
    ) {
      isParentOfSubsplitActive = true;
    }

    if (valueType === Column.Sum) {
      let color = 'neutral';
      let appender = '';

      if (this.pbRun) {
        let currentAdjustedScore =
          currentRun.sumTable[splitId] - this.getDeathPointsUpToSplitId(currentRun, splitId);
        let pbAdjustedScore =
          this.pbRun.sumTable[splitId] - this.getDeathPointsUpToSplitId(this.pbRun, splitId);

        let percentDifference = this.getPercentDifference(currentAdjustedScore, pbAdjustedScore);
        if (currentAdjustedScore > pbAdjustedScore) {
          appender = '+';
          if (percentDifference <= 3) {
            color = 'light-green';
          } else if (percentDifference > 3 && percentDifference < 9) {
            color = 'green';
          } else if (percentDifference >= 9) {
            color = 'strong-green';
          }
        } else if (currentAdjustedScore < pbAdjustedScore) {
          appender = '-';
          if (percentDifference <= 3) {
            color = 'light-red';
          } else if (percentDifference > 3 && percentDifference < 9) {
            color = 'red';
          } else if (percentDifference >= 9) {
            color = 'strong-red';
          }
        }
      }

      let value;
      if (isParentOfSubsplitActive) {
        color = 'neutral';
        appender = '...';

        value = currentRun.sumTable[splitId]
          ? formatNumber(currentRun.sumTable[splitId], 'en-US')
          : null;
      } else {
        value = currentRun.sumTable[splitId]
          ? formatNumber(currentRun.sumTable[splitId], 'en-US')
          : null;
      }

      return {
        value: value,
        appender: appender,
        color: color,
        hasDesignator: false
      };
    } else if (valueType === Column.SplitValue) {
      let color = 'neutral';

      if (currentRun.splitFinishes[splitId]) {
        let percentDifference = this.getPercentDifference(
          currentRun.splitFinishes[splitId],
          this.pbSplitSegmentValues[splitId]
        );

        if (currentRun.splitFinishes[splitId] > this.splitMaximums[splitId]) {
          color = 'gold';
        } else if (currentRun.splitFinishes[splitId] > this.pbSplitSegmentValues[splitId]) {
          if (percentDifference <= 3) {
            color = 'light-green';
          } else if (percentDifference > 3 && percentDifference < 9) {
            color = 'green';
          } else if (percentDifference >= 9) {
            color = 'strong-green';
          }
        }

        if (currentRun.splitFinishes[splitId] < this.pbSplitSegmentValues[splitId]) {
          if (percentDifference <= 3) {
            color = 'light-red';
          } else if (percentDifference > 3 && percentDifference < 9) {
            color = 'red';
          } else if (percentDifference >= 9) {
            color = 'strong-red';
          }
        }
      }

      let value;
      if (isParentOfSubsplitActive) {
        color = 'neutral';
        value = currentRun.splitFinishes[splitId]
          ? '...' + formatNumber(currentRun.splitFinishes[splitId], 'en-US')
          : null;
      } else {
        value = currentRun.splitFinishes[splitId]
          ? formatNumber(currentRun.splitFinishes[splitId], 'en-US')
          : null;
      }

      return {
        value: value,
        color: color,
        hasDesignator: true
      };
    } else if (valueType === Column.VsPB) {
      if (isParentOfSubsplitActive) {
        return {
          appender: '',
          value: null,
          color: 'neutral',
          hasDesignator: false
        };
      }

      if (!this.pbRun) {
        return {
          appender: '',
          value: null,
          color: 'neutral',
          hasDesignator: false
        };
      }

      let percentDifference = this.getPercentDifference(
        currentRun.sumTable[splitId],
        this.pbSplitSumValues[splitId]
      );

      if (currentRun.splitFinishes[splitId] > this.splitMaximums[splitId]) {
        return {
          appender: '+',
          value: currentRun.sumTable[splitId]
            ? formatNumber(currentRun.sumTable[splitId] - this.pbSplitSumValues[splitId], 'en-US')
            : null,
          color: 'gold',
          hasDesignator: true
        };
      } else if (currentRun.sumTable[splitId] === this.pbSplitSumValues[splitId]) {
        return {
          appender: '',
          value: currentRun.sumTable[splitId] ? '-' : null,
          color: 'neutral',
          hasDesignator: true
        };
      } else if (currentRun.sumTable[splitId] > this.pbSplitSumValues[splitId]) {
        let color = '';

        if (percentDifference <= 3) {
          color = 'light-green';
        } else if (percentDifference > 3 && percentDifference < 9) {
          color = 'green';
        } else if (percentDifference >= 9) {
          color = 'strong-green';
        }

        return {
          appender: '+',
          value: currentRun.sumTable[splitId]
            ? formatNumber(currentRun.sumTable[splitId] - this.pbSplitSumValues[splitId], 'en-US')
            : null,
          color: color,
          hasDesignator: true
        };
      } else if (currentRun.sumTable[splitId] < this.pbSplitSumValues[splitId]) {
        let color = '';

        if (percentDifference <= 3) {
          color = 'light-red';
        } else if (percentDifference > 3 && percentDifference < 9) {
          color = 'red';
        } else if (percentDifference >= 9) {
          color = 'strong-red';
        }

        return {
          appender: '-',
          value: currentRun.sumTable[splitId]
            ? formatNumber(
                Math.abs(currentRun.sumTable[splitId] - this.pbSplitSumValues[splitId]),
                'en-US'
              )
            : null,
          color: color,
          hasDesignator: true
        };
      }
    }
  }

  getSplitMaximums(runs: Run[]): number[] {
    let maximums: number[] = [];

    runs.forEach(run => {
      run.splitFinishes.forEach((splitFinish, finishIndex) => {
        if (!maximums[finishIndex] || maximums[finishIndex] < splitFinish) {
          maximums[finishIndex] = splitFinish;
        }
      });
    });

    return maximums;
  }

  getPbRun(runs: Run[]): Run {
    let highestFoundPb: number = 0;
    let pbRun: Run;

    runs.forEach(run => {
      if (
        run.sumTable[run.sumTable.length - 1] &&
        run.sumTable[run.sumTable.length - 1] > highestFoundPb
      ) {
        pbRun = run;
      }
    });

    return pbRun;
  }

  decrementScroll() {
    document.getElementById('splits-list').scrollTop -= 30;
  }

  incrementScroll() {
    document.getElementById('splits-list').scrollTop += 30;
  }

  getIfHasSubsplits(splitDisplays: SplitDisplay[]): boolean {
    let hasSubsplits = false;

    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        hasSubsplits = true;
      }
    });

    return hasSubsplits;
  }

  getIfAnySubsplitIsActive(splitDisplay: SplitDisplay, currentRun: Run): boolean {
    let isActive = false;

    if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
      splitDisplay.subsplits.forEach(subsplit => {
        if (subsplit.id === currentRun.currentSplitId) {
          isActive = true;
        }
      });
    }

    return isActive;
  }

  getIfElementVisible(element, percentX = 90, percentY = 90) {
    var tolerance = 0.01; //needed because the rects returned by getBoundingClientRect provide the position up to 10 decimals

    try {
      var elementRect = element.getBoundingClientRect();
      var parentRects = [];
    } catch (e) {
      return true;
    }

    while (element.parentElement != null) {
      parentRects.push(element.parentElement.getBoundingClientRect());
      element = element.parentElement;
    }

    var visibleInAllParents = parentRects.every(function(parentRect) {
      var visiblePixelX =
        Math.min(elementRect.right, parentRect.right) - Math.max(elementRect.left, parentRect.left);
      var visiblePixelY =
        Math.min(elementRect.bottom, parentRect.bottom) - Math.max(elementRect.top, parentRect.top);
      var visiblePercentageX = (visiblePixelX / elementRect.width) * 100;
      var visiblePercentageY = (visiblePixelY / elementRect.height) * 100;
      return visiblePercentageX + tolerance > percentX && visiblePercentageY + tolerance > percentY;
    });
    return visibleInAllParents;
  }

  getIfShouldAutoScroll() {}

  getSplitCount(splitDisplay: SplitDisplay) {
    let splitCount = 1;

    if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
      splitCount += splitDisplay.subsplits.length;
    }

    return splitCount;
  }

  onScroll(e: MouseWheelEvent) {
    if (e.wheelDelta < 0) {
      this.incrementScroll();
    }

    if (e.wheelDelta > 0) {
      this.decrementScroll();
    }
  }
}
