import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMaps, PolylineOptions } from '@ionic-native/google-maps';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { Constants } from '../constants.service';
import { GlobService } from '../glob.service';

@Component({
  selector: 'app-buses',
  templateUrl: './buses.page.html',
  styleUrls: ['./buses.page.scss'],
})
export class BusesPage implements OnInit {

  map: GoogleMap;
  @ViewChild('map_canvas') public map_canvas: any;
  BUSES = [8,9,11,14,15,23,24,25,26,38,43,59,73,74,88,100,139,148,159,188,205,274,390,453];
  routes = {};

  constructor(private platform: Platform,
    private file: File,
    private glob: GlobService) { }

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();
    //this.BUSES = await this.glob.post('/get_buses', {});
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {});
    this.map.moveCamera({target: {lat: 51.509116, lng: -0.127934}, zoom: 15, tilt: 30});  
  }  

  async click(route) {
    if (!(route in this.routes)) {
      this.routes[route] = await this.glob.post('/get_bus', {route: route});
    }
    if ('line' in this.routes[route]) {
      let r = this.routes[route];
      r.line.remove();
      delete r.line;
    }
    else {
      let pts = this.routes[route].stops.map((e) => {return {lat: e.lat, lng: e.lng}});
      let options: PolylineOptions = {
        points: pts, 
        color: Constants.getColor(this.BUSES.indexOf(route)),
        width: 5,
        geodesic: true,
      };         
      this.routes[route]['line'] = this.map.addPolylineSync(options);
    }
  }

  btnStyle(r) {
    return (r in this.routes) && ('line' in this.routes[r]) ? 'btn_pressed' : "";
  }
}
