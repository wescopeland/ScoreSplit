import { Component, Input, OnInit } from "@angular/core";
const { fork } = require("child_process");

import { ScoresplitMessengerService } from "../../messenger/messenger.service";

@Component({
  selector: "ss-game-vision-input",
  templateUrl: "./game-vision-input.component.html"
})
export class GameVisionInputComponent implements OnInit {
  @Input("driver") driver: string;

  private _gameVisionInstance: any;

  constructor(private _messenger: ScoresplitMessengerService) {
    this._gameVisionInstance = fork("index.js", {
      cwd: "node_modules/@wescopeland/game-vision/lib",
      silent: true
    });

    this._gameVisionInstance.stdout.on("data", data => {
      let message = data.toString();
      console.log(`AUTOSPLITTER SAYS: ${message}`);

      if (message.includes("START")) {
      }

      if (message.includes("CLEARED")) {
        this._messenger.publishMessage(
          "SPLIT",
          parseInt(message.split(" ")[2]),
          "GameVisionInputComponent"
        );
      }
    });
  }

  ngOnInit() {}
}
