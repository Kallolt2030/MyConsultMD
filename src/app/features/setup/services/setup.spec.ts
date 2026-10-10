import { TestBed } from '@angular/core/testing';
import { Setup } from './setup';

describe('Setup', () => {
  let service: Setup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Setup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
