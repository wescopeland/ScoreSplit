import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "ss-most-recent-split-value",
  templateUrl: "./most-recent-split-value.component.html",
  styleUrls: ["./most-recent-split-value.component.scss"]
})
export class MostRecentSplitValueComponent implements OnInit {
  @Input("recent-value") recentValue: number;

  constructor() {}

  ngOnInit() {}
}
