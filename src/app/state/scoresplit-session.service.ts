import { Injectable, ApplicationRef } from '@angular/core';
import { ScoresplitSessionStore } from './scoresplit-session.store';

@Injectable({ providedIn: 'root' })
export class ScoresplitSessionService {
  constructor(private _store: ScoresplitSessionStore, private _ref: ApplicationRef) {}

  toggleLayoutEditing() {
    this._store.update(state => {
      console.log(state);
      return { ...state, isEditingLayout: !state.isEditingLayout };
    });

    this._ref.tick();
  }
}
