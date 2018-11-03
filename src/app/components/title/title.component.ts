import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "ss-title",
  templateUrl: "./title.component.html",
  styleUrls: ["./title.component.scss"]
})
export class TitleComponent implements OnInit {
  @Input("attempt-count") attemptCount: number;
  @Input("game-name") gameName: string;
  @Input("category") category: string;

  constructor() {}

  ngOnInit() {}
}
