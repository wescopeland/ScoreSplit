import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "ss-split",
  templateUrl: "./split.component.html",
  styleUrls: ["./split.component.scss"]
})
export class SplitComponent implements OnInit {
  @Input("is-alternating") isAlternating: boolean;
  @Input("is-current") isCurrent: boolean;
  @Input("is-done") isDone: boolean;
  @Input("is-final") isFinal: boolean;
  @Input("is-subsplit") isSubsplit: boolean;
  @Input("main-label") mainLabel: string;
  @Input("column-one-value") columnOneValue: string;
  @Input("column-two-value") columnTwoValue: string;

  constructor() {}

  ngOnInit() {}
}
