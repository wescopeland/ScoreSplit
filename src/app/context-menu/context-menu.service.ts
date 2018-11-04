import { Injectable } from '@angular/core';
import { SplitFileHandler } from './split-file-handler.service';

@Injectable({ providedIn: 'root' })
export class ContextMenu {
  constructor(private _splitFileHandler: SplitFileHandler) {
    require('electron-context-menu')({
      prepend: (params, browserWindow) => [
        {
          label: 'Save Splits',
          click: function() {
            console.log('clicked');
          }
        }
        // {
        //   type: 'separator'
        // },
        // {
        //   label: 'Rainbow2'
        // }
      ],
      showInspectElement: false
    });
  }
}
