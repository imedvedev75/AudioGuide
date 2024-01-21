import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-input-value',
  templateUrl: './input-value.page.html',
  styleUrls: ['./input-value.page.scss'],
})
export class InputValuePage implements OnInit {

  public header: string;
  public value_name: string;
  
  @ViewChild('valueField') public valueField: any;
  valueText: string;
  footer: string;
  
  constructor(private modalCtrl: ModalController,
    private navParam: NavParams) {
      this.header = this.navParam.get('header');
      this.value_name = this.navParam.get('value_name');
    }

  ngOnInit() {
    setTimeout(function() {
      this.valueField.setFocus();
    }.bind(this), 200);

  }

  async submit() { 
    try {
      this.modalCtrl.dismiss(this.valueText);
    }
    catch(error) {
      this.footer = error;
    }
   }

   close() {
     this.modalCtrl.dismiss(null);
   }
}
