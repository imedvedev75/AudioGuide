import { Component } from '@angular/core';
import { GoogleMap, GoogleMaps } from '@ionic-native/google-maps';
import { Platform } from '@ionic/angular';
import { GlobService } from '../glob.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
//import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public showList: boolean = true;
  map: GoogleMap;
  tracks: any;

  constructor(private platform: Platform,
    private glob: GlobService) {}

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();  
    this.loadTracks();
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      zoom: 2,
      tilt: 30
    });
  }

  async loadTracks() {
    this.tracks = await this.glob.post("/get_tracks", {});
  }

  async click(track) {
    var track_data = await this.glob.postArray("/get_track_data", {track_uuid: track.track_uuid});

    this.map.clear();

    this.map.addPolylineSync({
      points: track_data,
      color: '#AA00FF',
      width: 5,
      geodesic: true,
    });     
    this.map.animateCamera({target: track_data[0], zoom: 16, tilt: 30});  
  }

  showHide() {
    this.showList = !this.showList;
  }
}
