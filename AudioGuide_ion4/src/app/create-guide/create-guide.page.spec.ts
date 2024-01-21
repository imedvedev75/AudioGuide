import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGuidePage } from './create-guide.page';

describe('CreateGuidePage', () => {
  let component: CreateGuidePage;
  let fixture: ComponentFixture<CreateGuidePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGuidePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGuidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
