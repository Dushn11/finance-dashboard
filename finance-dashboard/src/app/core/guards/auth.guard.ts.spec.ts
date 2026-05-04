import { TestBed } from '@angular/core/testing';

import { AuthGuardTs } from './auth.guard.ts';

describe('AuthGuardTs', () => {
  let service: AuthGuardTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthGuardTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
