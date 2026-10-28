import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgendaRefreshService {
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  requestRefresh(): void {
    console.log('[AgendaRefresh] Refresh solicitado');
    this.refreshSubject.next();
  }
}