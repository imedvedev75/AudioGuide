import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'my-tab-button',
  templateUrl: './my-tab-button.component.html',
  styleUrls: ['./my-tab-button.component.scss'],
})

export class MyTabButtonComponent implements OnInit {

  @Input('icon') icon;
  @Input('text') text;

  public selected: boolean = false;

  constructor() { }

  ngOnInit() {}

  click() {
    console.log("click tab btn");
  }

}
