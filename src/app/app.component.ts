import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ContextMenu } from './context-menu/context-menu.service';
import { ScoresplitStateService } from './state/service/state.service';
import { ScoresplitMessengerService } from './messenger/messenger.service';
import { SplitArchive } from './state/models/split-archive.model';
import { Split } from './state/models/split.model';
import { SplitDisplay } from './state/models/split-display.model';
import { Run } from './state/models/run.model';

import { DkPbSplitArchive } from './state/demo/dk-pb.split-archive';
import { donkeyKongSplits } from './state/demo/donkey-kong.splits';
import { donkeyKongRemixSplits } from './state/demo/donkey-kong-remix.splits';
import { pacManSplits } from './state/demo/pac-man.splits';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public currentRun: Run;
  public currentSplitArchive: SplitArchive;
  public recentValue: number;
  public splitDisplays: SplitDisplay[];
  public splitSet: { maxLives: number; splits: Split[] };

  private _subscription: Subscription;

  constructor(
    private _contextMenu: ContextMenu,
    private _state: ScoresplitStateService,
    private _messenger: ScoresplitMessengerService
  ) {
    this.splitSet = donkeyKongSplits;
    this.splitDisplays = this._state.generateSplitDisplays(this.splitSet.splits);
    this.currentRun = this._state.beginRun(this.splitDisplays);

    console.log(this.splitDisplays);
    console.log(this.currentRun);

    this.currentSplitArchive = DkPbSplitArchive;
    if (!this.currentSplitArchive) {
      this.currentSplitArchive = {
        splits: this.splitSet.splits,
        runs: [],
        title: 'Donkey Kong Spooky Remix',
        category: 'Any% Default Settings',
        attemptCount: 0
      };
    } else {
    }
  }

  ngOnInit() {
    this.initializeMessageSubscriptions();
  }

  handleResetRun(): void {
    this.currentSplitArchive = this._state.updateSplitArchive(
      this.currentRun,
      this.splitSet.splits,
      this.currentSplitArchive
    );

    this.recentValue = null;
    this.splitDisplays = this._state.generateSplitDisplays(this.splitSet.splits);
    this.currentRun = this._state.beginRun(this.splitDisplays);
    this._state.restart();

    console.log('currentSplitArchive', this.currentSplitArchive);
  }

  initializeMessageSubscriptions(): void {
    this._subscription = this._messenger.getMessages().subscribe(e => {
      if (e.header === 'SPLIT') {
        this.recentValue = e.message;
        this.currentRun = {
          ...this._state.split(e.message, this.currentRun, this.splitDisplays)
        };
      }

      if (e.header === 'DEATH') {
        this.currentRun = {
          ...this._state.addDeath(e.message, this.currentRun, this.splitDisplays)
        };
      }

      if (e.header === 'BONUS') {
        this.currentRun = {
          ...this._state.addBonus(e.message, this.currentRun)
        };
      }
    });
  }
}
