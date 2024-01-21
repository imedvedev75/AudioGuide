import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseFilePage } from './browse-file.page';

describe('BrowseFilePage', () => {
  let component: BrowseFilePage;
  let fixture: ComponentFixture<BrowseFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseFilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
