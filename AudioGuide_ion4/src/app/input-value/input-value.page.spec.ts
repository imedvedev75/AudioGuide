import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputValuePage } from './input-value.page';

describe('InputValuePage', () => {
  let component: InputValuePage;
  let fixture: ComponentFixture<InputValuePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputValuePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputValuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
