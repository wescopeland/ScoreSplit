import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ScoresplitMessengerService {
  private _messenger = new Subject<any>();

  publishMessage(header: string, message: any, from?: string): void {
    this._messenger.next({
      header: header,
      message: message,
      from: from ? from : null
    });
  }

  getMessages(): Observable<any> {
    return this._messenger.asObservable();
  }

  constructor() {}
}
