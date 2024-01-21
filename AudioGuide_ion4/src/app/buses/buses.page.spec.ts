import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusesPage } from './buses.page';

describe('BusesPage', () => {
  let component: BusesPage;
  let fixture: ComponentFixture<BusesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
