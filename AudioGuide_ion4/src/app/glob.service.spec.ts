import { TestBed } from '@angular/core/testing';

import { GlobService } from './glob.service';

describe('GlobService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobService = TestBed.get(GlobService);
    expect(service).toBeTruthy();
  });
});
