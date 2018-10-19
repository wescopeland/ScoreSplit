import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input
} from "@angular/core";
import { Subscription } from "rxjs";
import * as leftPad from "left-pad";

import { ScoresplitMessengerService } from "../../messenger/messenger.service";
import { Run } from "../../state/models/run.model";
import { Split } from "../../state/models/split.model";
import { SplitDisplay } from "../../state/models/split-display.model";

@Component({
  selector: "ss-splits-list",
  templateUrl: "./splits-list.component.html",
  styleUrls: ["./splits-list.component.scss"]
})
export class SplitsListComponent implements OnInit, OnChanges {
  @Input("current-run") currentRun: Run;
  @Input("split-displays") splitDisplays: SplitDisplay[];

  public desiredVisibleSplits = 5;
  public visibleSplitIds = [];

  private _subscription: Subscription;

  constructor(private _messenger: ScoresplitMessengerService) {}

  ngOnInit() {
    this._subscription = this._messenger.getMessages().subscribe(msg => {
      // if (msg.header === "SPLIT") {
      //   setTimeout(() => {
      //
      //   })
      //     this.getIfElementVisible(
      //       document.getElementsByClassName("splits--split__current")[0]
      //     )
      //   );
      // }
    });

    this.activate();
  }

  ngOnChanges(e: SimpleChanges) {
    setTimeout(() => {
      let element = document.getElementsByClassName(
        "splits--split__current"
      )[0];

      if (element) {
        let isActiveSplitVisible = this.getIfElementVisible(element);

        if (!isActiveSplitVisible) {
          this.incrementScroll();
        }
      }

      if (this.getIfHasSubsplits(this.splitDisplays)) {
        let finalSubsplitElement = document.getElementsByClassName(
          "last-subsplit"
        )[0];

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
  }

  activate() {
    console.log(this.splitDisplays.length);
  }

  decrementScroll() {
    document.getElementById("splits-list").scrollTop -= 30;
  }

  incrementScroll() {
    document.getElementById("splits-list").scrollTop += 30;
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

  getIfAnySubsplitIsActive(
    splitDisplay: SplitDisplay,
    currentRun: Run
  ): boolean {
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

    var elementRect = element.getBoundingClientRect();
    var parentRects = [];

    while (element.parentElement != null) {
      parentRects.push(element.parentElement.getBoundingClientRect());
      element = element.parentElement;
    }

    var visibleInAllParents = parentRects.every(function(parentRect) {
      var visiblePixelX =
        Math.min(elementRect.right, parentRect.right) -
        Math.max(elementRect.left, parentRect.left);
      var visiblePixelY =
        Math.min(elementRect.bottom, parentRect.bottom) -
        Math.max(elementRect.top, parentRect.top);
      var visiblePercentageX = (visiblePixelX / elementRect.width) * 100;
      var visiblePercentageY = (visiblePixelY / elementRect.height) * 100;
      return (
        visiblePercentageX + tolerance > percentX &&
        visiblePercentageY + tolerance > percentY
      );
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
