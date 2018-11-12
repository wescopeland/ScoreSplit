import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';

import { ScoresplitSession } from './scoresplit-session.model';
import { ScoresplitSessionStore } from './scoresplit-session.store';

@Injectable({ providedIn: 'root' })
export class ScoresplitSessionQuery extends Query<ScoresplitSession> {
  constructor(protected store: ScoresplitSessionStore) {
    super(store);
  }
}
