import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyGuidesPage } from './my-guides.page';

describe('MyGuidesPage', () => {
  let component: MyGuidesPage;
  let fixture: ComponentFixture<MyGuidesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyGuidesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyGuidesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
