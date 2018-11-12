import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { ScoresplitStateService } from './state/service/state.service';
import { ScoresplitSessionQuery } from './state/scoresplit-session.query';
import { ScoresplitMessengerService } from './messenger/messenger.service';
import { SplitArchive } from './state/models/split-archive.model';
import { Split } from './state/models/split.model';
import { SplitDisplay } from './state/models/split-display.model';
import { Run } from './state/models/run.model';
import { Layout, LayoutElement } from './state/models/layout.model';

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
  public isEditingLayout$ = this._sessionQuery.select(state => state.isEditingLayout);
  public layout: Layout;
  public recentValue: number;
  public splitDisplays: SplitDisplay[];
  public splitSet: { maxLives: number; splits: Split[] };

  private _subscription: Subscription;

  constructor(
    private _cd: ChangeDetectorRef,
    private _state: ScoresplitStateService,
    private _sessionQuery: ScoresplitSessionQuery,
    private _messenger: ScoresplitMessengerService
  ) {
    this.layout = {
      elements: [
        LayoutElement.Title,
        LayoutElement.SplitsList,
        LayoutElement.MostRecentSplitValue,
        LayoutElement.Bonuses,
        LayoutElement.Deaths,
        LayoutElement.SumOfBest,
        LayoutElement.Pace,
        LayoutElement.ManualInput
      ]
    };
  }

  ngOnInit() {
    this.activate();
    this.initializeMessageSubscriptions();
  }

  activate() {
    this.splitSet = donkeyKongSplits;
    this.splitDisplays = this._state.generateSplitDisplays(this.splitSet.splits);
    this.currentRun = this._state.beginRun(this.splitDisplays);
    this.recentValue = null;

    console.log(this.splitDisplays);
    console.log(this.currentRun);

    console.log(this.currentSplitArchive);

    if (!this.currentSplitArchive) {
      this.currentSplitArchive = {
        splits: this.splitSet.splits,
        runs: [],
        title: 'Donkey Kong Spooky Remix',
        category: 'Any% Default Settings',
        attemptCount: 0
      };
    }
  }

  getLayoutElement(element: LayoutElement): string {
    let layoutElement = '';

    if (element === LayoutElement.Bonuses) {
      layoutElement = 'Bonuses';
    }

    if (element === LayoutElement.Deaths) {
      layoutElement = 'Deaths';
    }

    if (element === LayoutElement.ManualInput) {
      layoutElement = 'ManualInput';
    }

    if (element === LayoutElement.Pace) {
      layoutElement = 'Pace';
    }

    if (element === LayoutElement.SplitsList) {
      layoutElement = 'SplitsList';
    }

    if (element === LayoutElement.Title) {
      layoutElement = 'Title';
    }

    if (element === LayoutElement.SumOfBest) {
      layoutElement = 'SumOfBest';
    }

    if (element === LayoutElement.MostRecentSplitValue) {
      layoutElement = 'MostRecentSplitValue';
    }

    return layoutElement;
  }

  handleOpenedSplitArchive(archive: SplitArchive): void {
    this.currentSplitArchive = archive;

    this._state.restart();
    this.activate();

    this._cd.detectChanges();
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

    this._cd.detectChanges();

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
