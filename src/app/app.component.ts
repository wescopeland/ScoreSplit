import { Component } from "@angular/core";
import { Subscription } from "rxjs";

import { ScoresplitStateService } from "./state/state.service";
import { ScoresplitMessengerService } from "./messenger/messenger.service";
import { Split } from "./state/models/split.model";
import { SplitDisplay } from "./state/models/split-display.model";
import { Run } from "./state/models/run.model";

import { donkeyKongSplits } from "./state/demo/donkey-kong.splits";
import { pacManSplits } from "./state/demo/pac-man.splits";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  public currentRun: Run;
  public recentValue: number;
  public splitDisplays: SplitDisplay[];
  public splits: Split[];

  private _subscription: Subscription;

  constructor(
    private _state: ScoresplitStateService,
    private _messenger: ScoresplitMessengerService
  ) {
    this.splits = donkeyKongSplits;
    this.splitDisplays = this._state.generateSplitDisplays(this.splits);
    this.currentRun = this._state.beginRun(this.splitDisplays);

    console.log(this.splitDisplays);
    console.log(this.currentRun);

    this._subscription = this._messenger.getMessages().subscribe(e => {
      if (e.header === "SPLIT") {
        this.recentValue = e.message;
        this.currentRun = {
          ...this._state.split(e.message, this.currentRun, this.splitDisplays)
        };
      }

      if (e.header === "DEATH") {
        this.currentRun = {
          ...this._state.addDeath(
            e.message,
            this.currentRun,
            this.splitDisplays
          )
        };
      }
    });
  }
}
