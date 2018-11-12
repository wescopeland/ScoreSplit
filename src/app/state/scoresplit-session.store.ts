import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface ScoresplitSessionState {
  isEditingLayout: boolean;
}

export function createInitialState(): ScoresplitSessionState {
  return {
    isEditingLayout: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'scoresplitSession' })
export class ScoresplitSessionStore extends Store<ScoresplitSessionState> {
  constructor() {
    super(createInitialState());
  }
}
