import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private _open = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._open.asObservable();

  toggle()  { this._open.next(!this._open.value); }
  close()   { this._open.next(false); }
}
