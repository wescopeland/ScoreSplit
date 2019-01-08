import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MenuItem, remote } from 'electron';

import { ScoresplitSessionService } from '../state/scoresplit-session.service';
import { SplitFileHandler } from './split-file-handler.service';
import { Run } from '../state/models/run.model';
import { SplitArchive } from '../state/models/split-archive.model';

@Component({
  selector: 'ss-context-menu',
  template: ''
})
export class ContextMenuComponent implements OnInit {
  @Input('current-run') currentRun: Run;
  @Input('current-split-archive') currentSplitArchive: SplitArchive;

  @Output('opened-split-archive')
  openedSplitArchive: EventEmitter<SplitArchive> = new EventEmitter<SplitArchive>();

  @Output('reset-run') resetRun: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private _splitFileHandler: SplitFileHandler,
    private _sessionService: ScoresplitSessionService
  ) {}

  ngOnInit() {
    require('electron-context-menu')({
      prepend: (params, browserWindow) => [
        ...this.generateSplitManipulationMenuItems(),
        {
          type: 'separator'
        },
        {
          label: 'Reset Run',
          click: () => {
            this.resetRun.emit();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Edit Layout',
          click: () => {
            this._sessionService.toggleLayoutEditing();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'About',
          click: () => {
            remote.dialog.showMessageBox({
              type: 'info',
              message:
                'ScoreSplit, Alpha Build 0\n\nOriginally conceived and developed by @wescopeland_'
            });
          }
        }
      ],
      showInspectElement: true
    });
  }

  generateSplitManipulationMenuItems(): any[] {
    let menuItems: any[] = [];

    // Open Splits
    menuItems.push({
      label: 'Open Splits',
      submenu: [
        {
          label: 'From file...',
          click: () => {
            const openedArchive = this._splitFileHandler.openSplits();
            this.openedSplitArchive.emit(openedArchive);
          }
        }
      ]
    });

    // Save Splits
    menuItems.push({
      label: 'Save Splits',
      click: () => {
        this._splitFileHandler.saveSplits(this.currentSplitArchive);
      }
    });

    // Save Splits As
    menuItems.push({
      label: 'Save Splits As...',
      click: () => {
        this._splitFileHandler.saveSplitsAs(this.currentSplitArchive);
      }
    });

    return menuItems;
  }
}
