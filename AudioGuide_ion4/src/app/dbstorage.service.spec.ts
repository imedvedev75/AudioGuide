import { TestBed } from '@angular/core/testing';

import { DBStorageService } from './dbstorage.service';

describe('DBStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DBStorageService = TestBed.get(DBStorageService);
    expect(service).toBeTruthy();
  });
});
