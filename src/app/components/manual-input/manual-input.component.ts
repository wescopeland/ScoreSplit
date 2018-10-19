import { Component, OnInit } from "@angular/core";
import { ScoresplitMessengerService } from "../../messenger/messenger.service";

@Component({
  selector: "ss-manual-input",
  templateUrl: "./manual-input.component.html",
  styleUrls: ["./manual-input.component.scss"]
})
export class ManualInputComponent implements OnInit {
  public currentInputValue: string = "";

  constructor(private _messenger: ScoresplitMessengerService) {}

  ngOnInit() {}

  handleKeyup(e) {
    if (e.key === "Enter" && this.currentInputValue.trim().length) {
      this.submit(this.currentInputValue);
    }
  }

  submit(val: string) {
    if (!val.includes("d")) {
      this._messenger.publishMessage(
        "SPLIT",
        parseInt(val),
        "ManualInputComponent"
      );
    }

    if (val.includes("d")) {
      this._messenger.publishMessage(
        "DEATH",
        parseInt(val.split("d")[0]),
        "ManualInputComponent"
      );
    }

    this.currentInputValue = "";
  }
}
