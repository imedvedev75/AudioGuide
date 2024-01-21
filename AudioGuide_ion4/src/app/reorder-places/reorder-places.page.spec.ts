import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderPlacesPage } from './reorder-places.page';

describe('ReorderPlacesPage', () => {
  let component: ReorderPlacesPage;
  let fixture: ComponentFixture<ReorderPlacesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReorderPlacesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReorderPlacesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
