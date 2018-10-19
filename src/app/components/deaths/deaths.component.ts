import { Component, OnInit, Input } from "@angular/core";
import { Death } from "../../state/models/death.model";

@Component({
  selector: "ss-deaths",
  templateUrl: "./deaths.component.html",
  styleUrls: ["./deaths.component.scss"]
})
export class DeathsComponent implements OnInit {
  @Input("deaths") deaths: Death[] = [];
  @Input("show-detailed-display") showDetailedDisplay: boolean;

  constructor() {}

  ngOnInit() {}

  getSumOfDeaths(deaths: Death[]): number {
    let sum: number = 0;

    deaths.forEach(death => {
      sum += death.diffValue;
    });

    return sum;
  }
}
