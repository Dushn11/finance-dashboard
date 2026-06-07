import { TestBed } from '@angular/core/testing';

import { AsyncValidators } from './async-validators';

describe('AsyncValidators', () => {
  let service: AsyncValidators;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsyncValidators);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
