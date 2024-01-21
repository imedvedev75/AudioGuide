import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlacePage } from './edit-place.page';

describe('EditPlacePage', () => {
  let component: EditPlacePage;
  let fixture: ComponentFixture<EditPlacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPlacePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPlacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
