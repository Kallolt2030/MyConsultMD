import { TestBed } from '@angular/core/testing';
import { AgendaRefresh } from './agenda-refresh';

describe('AgendaRefresh', () => {
  let service: AgendaRefresh;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendaRefresh);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
