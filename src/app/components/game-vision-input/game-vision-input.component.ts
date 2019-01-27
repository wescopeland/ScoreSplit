import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
const { fork, spawn } = require('child_process');

import { ScoresplitMessengerService } from '../../messenger/messenger.service';

@Component({
  selector: 'ss-game-vision-input',
  templateUrl: './game-vision-input.component.html'
})
export class GameVisionInputComponent implements OnInit {
  @Input('driver') driver: string;

  private _gameVisionInstance: any;
  private _subscription: Subscription;

  constructor(private _messenger: ScoresplitMessengerService) {}

  initializeGameVision(): void {
    this._gameVisionInstance = null;
    console.log('starting game vision input...');

    this._gameVisionInstance = fork('index.js', {
      cwd: 'node_modules/@wescopeland/game-vision/lib',
      silent: true
    });

    setTimeout(() => {
      this._gameVisionInstance.stdout.on('data', data => {
        let message = data.toString();
        console.log(`AUTOSPLITTER SAYS: ${message}`);

        if (message.includes('START')) {
          this._messenger.publishMessage('RESET', null, 'GameVisionInputComponent');
        }

        if (message.includes('CLEARED')) {
          this._messenger.publishMessage(
            'SPLIT',
            parseInt(message.split(' ')[1]),
            'GameVisionInputComponent'
          );
        }

        if (message.includes('DEATH')) {
          this._messenger.publishMessage(
            'DEATH',
            parseInt(message.split(' ')[1]),
            'GameVisionInputComponent'
          );
        }
      });
    });
  }

  initializeMessageSubscriptions(): void {
    this._subscription = this._messenger.getMessages().subscribe(e => {
      if (e.header === 'AUTOCAPTURE') {
        this._gameVisionInstance.stdin.write('b\r\n');
      }

      if (e.header === 'AUTORESET') {
        this._gameVisionInstance.stdin.write('r\r\n');
      }
    });
  }

  ngOnInit() {
    this.initializeGameVision();
    this.initializeMessageSubscriptions();
  }
}
