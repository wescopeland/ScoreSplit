import { writeFileSync, readFileSync } from 'fs';
import { Injectable } from '@angular/core';
import { remote } from 'electron';
const slugify = require('slugify');

import { SplitArchive } from '../state/models/split-archive.model';

@Injectable({ providedIn: 'root' })
export class SplitFileHandler {
  private _currentSplitsFilePath: string;

  constructor() {}

  openSplits(): SplitArchive {
    const openPath = remote.dialog.showOpenDialog({
      filters: [{ name: 'Scoresplit Split Archives', extensions: ['splits'] }]
    });

    try {
      const openedSplitArchive = JSON.parse(readFileSync(openPath[0]).toString());
      return openedSplitArchive;
    } catch (e) {
      console.error('Unable to open split archive', e);
    }
  }

  saveSplits(splitArchive: SplitArchive) {
    if (!this._currentSplitsFilePath) {
      this.saveSplitsAs(splitArchive);
      return;
    }

    writeFileSync(this._currentSplitsFilePath, JSON.stringify(splitArchive));
  }

  saveSplitsAs(splitArchive: SplitArchive) {
    const newFileName = slugify(splitArchive.title, {
      replacement: '-',
      lower: true
    });

    console.log(newFileName);

    const savePath = remote.dialog.showSaveDialog({
      defaultPath: `${newFileName}.splits`
    });

    if (savePath) {
      this._currentSplitsFilePath = savePath;
      writeFileSync(savePath, JSON.stringify(splitArchive));
    }
  }
}
