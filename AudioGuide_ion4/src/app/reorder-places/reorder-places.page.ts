import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reorder-places',
  templateUrl: './reorder-places.page.html',
  styleUrls: ['./reorder-places.page.scss'],
})
export class ReorderPlacesPage implements OnInit {

  public places;
  callback;

  constructor(private navParam: NavParams,
    private modalCtrl: ModalController) { }

  ngOnInit() {
    this.places = this.navParam.get('places');
    this.callback = this.navParam.get('callback');
  }

  doReorder(ev: any) {
    let from = ev.detail.from;
    let to = ev.detail.to;

    let a = this.places[from];
    this.places[from] = this.places[to];
    this.places[to] = a;

    this.callback(from, to);

    ev.detail.complete();
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

}
