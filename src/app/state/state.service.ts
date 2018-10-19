import { Injectable } from "@angular/core";
import * as leftPad from "left-pad";

import { Run } from "./models/run.model";
import { SplitDisplay } from "./models/split-display.model";
import { Split } from "./models/split.model";
import { Death } from "./models/death.model";

@Injectable({ providedIn: "root" })
export class ScoresplitStateService {
  private _lastEnteredScore: number;

  constructor() {}

  private _convertLabelMaskToLabel(
    labelMask: string,
    iteration: number
  ): string {
    let sigfigCount = labelMask.split("$").length - 1;

    let splitter: string = "";
    for (let i = 0; i < sigfigCount; i += 1) {
      splitter += "$";
    }

    let injection = leftPad(iteration, sigfigCount, 0);
    let splitMask = labelMask.split(splitter);

    for (let i = 0; i < splitMask.length; i += 1) {
      if (!splitMask[i].length) {
        splitMask[i] = String(injection);
      }
    }

    return splitMask.join("");
  }

  addDeath(val: number, currentRun: Run, splitDisplays: SplitDisplay[]): Run {
    let modifiedRun = currentRun;
    let diffValue = 0;
    let mostRecentDeathSum = 0;

    // Are there any other deaths on this split?
    let hasPreexistingSplitDeaths = false;
    if (currentRun.deaths && currentRun.deaths.length) {
      currentRun.deaths.forEach(death => {
        if (death.splitId === currentRun.currentSplitId) {
          hasPreexistingSplitDeaths = true;
          mostRecentDeathSum = death.sumValue;
        }
      });
    }

    if (!hasPreexistingSplitDeaths && this._lastEnteredScore) {
      diffValue = val - this._lastEnteredScore;
    }

    if (!hasPreexistingSplitDeaths && !this._lastEnteredScore) {
      diffValue = val;
    }

    if (hasPreexistingSplitDeaths) {
      diffValue = val - mostRecentDeathSum;
    }

    modifiedRun.deaths.push({
      splitId: currentRun.currentSplitId,
      diffValue: diffValue,
      sumValue: val
    });

    return modifiedRun;
  }

  beginRun(splitDisplays: SplitDisplay[]): Run {
    let newRun: Run;

    // Find the first active split.
    if (!splitDisplays[0].subsplits) {
      newRun = {
        currentSplitId: splitDisplays[0].id,
        splitFinishes: [],
        deaths: [],
        likenesses: []
      };
    } else {
      newRun = {
        currentSplitId: splitDisplays[0].subsplits[0].id,
        splitFinishes: [],
        deaths: [],
        likenesses: []
      };
    }

    // Find the last available split.
    let finalId: number = 0;
    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.id > finalId) {
        finalId = splitDisplay.id;
      }

      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        splitDisplay.subsplits.forEach(subsplit => {
          if (subsplit.id > finalId) {
            finalId = subsplit.id;
          }
        });
      }
    });

    newRun.splitFinishes = new Array(finalId);
    newRun.sumTable = new Array(finalId);

    return newRun;
  }

  generateSplitDisplays(splitMap: Split[]): SplitDisplay[] {
    let newSplitDisplays: SplitDisplay[] = [];

    let id = 0;
    let isAlternating: boolean = false;

    splitMap.forEach(split => {
      let newSplitDisplay: SplitDisplay;
      let newSubsplitDisplay: SplitDisplay;

      let currentRepeatGroup = 0;

      if (!split.isRepeating) {
        if (split.subsplits && split.subsplits.length) {
          newSplitDisplay = {
            id: id++,
            isAlternating: isAlternating,
            isCurrent: false,
            isDone: false,
            isSubsplit: false,
            mainLabel: split.label,
            subsplits: []
          };

          split.subsplits.forEach(subsplit => {
            newSubsplitDisplay = {
              id: id++,
              isAlternating: isAlternating,
              isCurrent: false,
              isDone: false,
              isSubsplit: true,
              mainLabel: subsplit.label
            };

            newSplitDisplay.subsplits.push(newSubsplitDisplay);
          });

          newSplitDisplays.push(newSplitDisplay);
          isAlternating = !isAlternating;
        } else {
          newSplitDisplay = {
            id: id++,
            isAlternating: isAlternating,
            isCurrent: false,
            isDone: false,
            isSubsplit: false,
            mainLabel: split.label
          };

          newSplitDisplays.push(newSplitDisplay);
          isAlternating = !isAlternating;
        }
      } else {
        if (split.subsplits && split.subsplits.length) {
          for (let i = split.startAt; i <= split.endAt; i += 1) {
            newSplitDisplay = {
              id: id++,
              isAlternating: isAlternating,
              isCurrent: false,
              isDone: false,
              isSubsplit: false,
              repeatGroup: currentRepeatGroup,
              mainLabel: this._convertLabelMaskToLabel(split.labelMask, i),
              subsplits: []
            };

            split.subsplits.forEach(subsplit => {
              newSubsplitDisplay = {
                id: id++,
                isAlternating: isAlternating,
                isCurrent: false,
                isDone: false,
                isSubsplit: true,
                likeness: subsplit.likeness ? subsplit.likeness : null,
                repeatGroup: currentRepeatGroup,
                mainLabel: this._convertLabelMaskToLabel(subsplit.label, i)
              };

              newSplitDisplay.subsplits.push(newSubsplitDisplay);
            });

            newSplitDisplays.push(newSplitDisplay);
            isAlternating = !isAlternating;
          }

          currentRepeatGroup += 1;
        } else {
          for (let i = split.startAt; i <= split.endAt; i += 1) {
            newSplitDisplay = {
              id: id++,
              isAlternating: isAlternating,
              isCurrent: false,
              isDone: false,
              isSubsplit: false,
              repeatGroup: currentRepeatGroup,
              mainLabel: this._convertLabelMaskToLabel(split.labelMask, i)
            };

            newSplitDisplays.push(newSplitDisplay);
            isAlternating = !isAlternating;
          }

          currentRepeatGroup += 1;
        }
      }
    });

    return newSplitDisplays;
  }

  getCurrentSplitDisplay(
    currentSplitId: number,
    splitDisplays: SplitDisplay[]
  ): SplitDisplay {
    let current: SplitDisplay;
    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.id === currentSplitId) {
        current = splitDisplay;
      }

      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        splitDisplay.subsplits.forEach(subsplit => {
          if (subsplit.id === currentSplitId) {
            current = subsplit;
          }
        });
      }
    });

    return current;
  }

  getIdsOfNonRepeatingSplits(splitDisplays: SplitDisplay[]): number[] {
    let ids = [];

    splitDisplays.forEach(splitDisplay => {
      if (!splitDisplay.hasOwnProperty("repeatGroup")) {
        ids.push(splitDisplay.id);
      }
    });

    return ids;
  }

  getIdsOfRepeatingSplits(splitDisplays: SplitDisplay[]): number[][] {
    let ids: number[][] = [];

    let currentRepeatGroup = 0;
    let currentGroupIds = [];

    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.hasOwnProperty("repeatGroup")) {
        if (splitDisplay.repeatGroup === currentRepeatGroup) {
          currentGroupIds.push(splitDisplay.id);
        } else {
          ids.push(currentGroupIds);

          currentGroupIds = [];
          currentRepeatGroup += 1;

          currentGroupIds.push(splitDisplay.id);
        }
      }
    });

    if (currentGroupIds.length) {
      ids.push(currentGroupIds);
    }

    return ids;
  }

  getAllSubsplitGroupsByGroupId(
    groupId: number,
    splitDisplays: SplitDisplay[]
  ): number[][] {
    let ids: number[][] = [];

    splitDisplays.forEach(splitDisplay => {
      if (
        splitDisplay.hasOwnProperty("repeatGroup") &&
        splitDisplay.repeatGroup === groupId
      ) {
        if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
          let subsplitIds = [];
          splitDisplay.subsplits.forEach(subsplit => {
            subsplitIds.push(subsplit.id);
          });

          ids.push(subsplitIds);
        }
      }
    });

    return ids;
  }

  getSplitById(id: number, splitDisplays: SplitDisplay[]): SplitDisplay {
    let split: SplitDisplay;

    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.id === id) {
        split = splitDisplay;
      }

      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        splitDisplay.subsplits.forEach(subsplit => {
          if (subsplit.id === id) {
            split = subsplit;
          }
        });
      }
    });

    return split;
  }

  getSubsplitsByParentId(
    id: number,
    splitDisplays: SplitDisplay[]
  ): SplitDisplay[] {
    let subsplits: SplitDisplay[];

    splitDisplays.forEach(splitDisplay => {
      if (
        splitDisplay.id === id &&
        splitDisplay.subsplits &&
        splitDisplay.subsplits.length
      ) {
        subsplits = splitDisplay.subsplits;
      }
    });

    return subsplits;
  }

  getParentBySubsplitId(
    id: number,
    splitDisplays: SplitDisplay[]
  ): SplitDisplay {
    let parent: SplitDisplay;

    splitDisplays.forEach(splitDisplay => {
      if (splitDisplay.subsplits && splitDisplay.subsplits.length) {
        splitDisplay.subsplits.forEach(subsplit => {
          if (subsplit.id === id) {
            parent = splitDisplay;
          }
        });
      }
    });

    return parent;
  }

  getDeathPointsBySplitId(id: number, currentRun: Run): number {
    let deathPoints: number = 0;

    currentRun.deaths.forEach(death => {
      if (death.splitId === id) {
        deathPoints += death.diffValue;
      }
    });

    return deathPoints;
  }

  split(val: number, currentRun: Run, splitDisplays: SplitDisplay[]): Run {
    let modifiedRun = currentRun;
    let currentSplit = this.getCurrentSplitDisplay(
      modifiedRun.currentSplitId,
      splitDisplays
    );

    // Get the difference from the last entered value.
    if (this._lastEnteredScore) {
      modifiedRun.splitFinishes[modifiedRun.currentSplitId] =
        val -
        this._lastEnteredScore -
        this.getDeathPointsBySplitId(modifiedRun.currentSplitId, modifiedRun);
    } else {
      modifiedRun.splitFinishes[modifiedRun.currentSplitId] =
        val -
        this.getDeathPointsBySplitId(modifiedRun.currentSplitId, modifiedRun);
    }

    modifiedRun.sumTable[modifiedRun.currentSplitId] = val;

    // If it has a likeness, attach it.
    if (currentSplit.likeness) {
      // Find the likeness if it already exists.
      let hasFoundLikeness = false;
      modifiedRun.likenesses.forEach(likeness => {
        if (likeness.label === currentSplit.likeness) {
          hasFoundLikeness = true;

          likeness.count += 1;
          likeness.ids.push(modifiedRun.currentSplitId);
          likeness.sum += modifiedRun.splitFinishes[modifiedRun.currentSplitId];
        }
      });

      // If we can't find it, create a new likeness.
      if (!hasFoundLikeness) {
        modifiedRun.likenesses.push({
          label: currentSplit.likeness,
          count: 1,
          sum: modifiedRun.splitFinishes[modifiedRun.currentSplitId],
          ids: [modifiedRun.currentSplitId]
        });
      }
    }

    // If it's a subsplit, we need to find its parent.
    if (currentSplit.isSubsplit) {
      let parent = this.getParentBySubsplitId(
        modifiedRun.currentSplitId,
        splitDisplays
      );

      let subsplitValueSum = 0;
      parent.subsplits.forEach(subsplit => {
        if (modifiedRun.splitFinishes[subsplit.id]) {
          subsplitValueSum = modifiedRun.splitFinishes[subsplit.id];
        }
      });

      modifiedRun.sumTable[parent.id] = val;
      if (!modifiedRun.splitFinishes[parent.id]) {
        modifiedRun.splitFinishes[parent.id] = subsplitValueSum;
      } else {
        modifiedRun.splitFinishes[parent.id] += subsplitValueSum;
      }

      // If the next active split is actually a subsplit, set
      // the currentSplitId correctly.
      let nextSplit: SplitDisplay = this.getSplitById(
        modifiedRun.currentSplitId + 1,
        splitDisplays
      );

      if (nextSplit) {
        if (nextSplit.subsplits && nextSplit.subsplits.length) {
          modifiedRun.currentSplitId += 2;
        } else {
          modifiedRun.currentSplitId += 1;
        }
      }
    } else {
      modifiedRun.currentSplitId += 1;
    }

    this._lastEnteredScore = val;
    return modifiedRun;
  }
}
