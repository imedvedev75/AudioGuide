import { Component, OnInit, ViewChild } from '@angular/core';
import { MyTabBarComponent } from '../my-tab-bar/my-tab-bar.component';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Polyline,
  LatLng,
  Marker
} from '@ionic-native/google-maps';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild(MyTabBarComponent) myTabBar: any;

  map: GoogleMap;

  constructor(private platform: Platform) { }

  async ngOnInit() {
  }

}
