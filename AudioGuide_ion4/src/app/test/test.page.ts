import { Component, OnInit } from '@angular/core';

import {
  GoogleMaps,
  GoogleMap,

} from '@ionic-native/google-maps';
import { Platform } from '@ionic/angular';
import { Environment } from '@ionic-native/google-maps/ngx';
import { GlobService } from '../glob.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {

  constructor(private platform: Platform,
    private geoloc: Geolocation) { }

  map: GoogleMap;
  environment: Environment = null;

  async ngOnInit() {
    await this.platform.ready();
    Environment.setBackgroundColor("grey");
    this.environment = new Environment();
    this.environment.setBackgroundColor("grey");
    await this.loadMap();

    try {
      var resp = await this.geoloc.getCurrentPosition();
      var ptOld = {lat: resp.coords.latitude, lng: resp.coords.longitude};
      this.map.animateCamera({target: ptOld, zoom: 16, tilt: 30});  
    }
    catch(error) {
        console.log('Error getting location, error: ' + error);
     }


    this.map.addPolylineSync({
      points: [{lat: 49.299067, lng: 8.643602}, {lat: 49.299402, lng: 8.644097}],
      color: '#AA00FF',
      width: 5
    }); 
    console.log("hi");
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
    });
  }

}
