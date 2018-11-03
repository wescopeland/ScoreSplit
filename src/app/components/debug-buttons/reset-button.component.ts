import { Component, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
  selector: "ss-reset-button",
  template: `<button class="btn btn-primary" (click)="reset()">Reset</button>`
})
export class ResetButtonComponent implements OnInit {
  @Output("reset-run") resetRun = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  reset(): void {
    this.resetRun.emit();
  }
}
