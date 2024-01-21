import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.page.html',
  styleUrls: ['./add-track.page.scss'],
})
export class AddTrackPage implements OnInit {

  @ViewChild('trackNameField') public trackNameField: any;
  trackNameText: string = "test";
  footer: string;
  
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    setTimeout(function() {
      this.trackNameField.setFocus();
    }.bind(this), 200);
  }

  async addTrack() { 
    try {
      this.modalCtrl.dismiss(this.trackNameText);
    }
    catch(error) {
      this.footer = error;
    }
  }

  close() {
     this.modalCtrl.dismiss(null);
  }
}
