import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrackPage } from './add-track.page';

describe('AddTrackPage', () => {
  let component: AddTrackPage;
  let fixture: ComponentFixture<AddTrackPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTrackPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTrackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
