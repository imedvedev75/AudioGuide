import { Component } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Polyline,
  LatLng,
  Marker,
  Environment
} from '@ionic-native/google-maps';
import { Platform, ModalController, LoadingController } from '@ionic/angular';
import { GlobService } from '../glob.service';
import { AddTrackPage } from '../add-track/add-track.page';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse, BackgroundGeolocationEvents } from '@ionic-native/background-geolocation/ngx';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public _tracking: boolean;
  public _bkMode: boolean; 
  public items: Array<any> = [];
  public startTime: number;
  public timeElapsed: number;
  public events: number;
  public eventsAdded: number;

  map: GoogleMap;

  private watch: any;
  private watchSubscr: any;
  ptOld = null;
  bLocWorks = false;
  pts: Array<any> = [];
  track_uuid: any;

  //statistics about get pos time
  private getPosCount: number = 0;
  private getPosTime: number = 0;
  public getPosMs: number = 0;
  public myColor: string = "transparent";
 
  constructor(
    private geoloc: Geolocation,
    private platform: Platform,
    private glob: GlobService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private backgroundMode: BackgroundMode,
    private backgroundGeolocation: BackgroundGeolocation
  ) {
  }

  async ngOnInit() {
    this._tracking = false;
    await this.platform.ready();

    //if (this.platform.is("desktop"))  {
    //  this.myColor = "#3c5064";
    //}

    await this.loadMap();  

    try {
      var resp = await this.geoloc.getCurrentPosition();
      this.ptOld = {lat: resp.coords.latitude, lng: resp.coords.longitude};
      this.map.animateCamera({target: this.ptOld, zoom: 16, tilt: 30});  
      this.bLocWorks = true;
      //this.glob.showToast('successfully got location');
    }
    catch(error) {
        this.glob.showToast('Error getting location, error: ' + error);
     }

     this.backgroundMode.disableWebViewOptimizations(); 
  }

  trackDisabled() {
    return this._tracking || !this.bLocWorks;
  }

  stopDisabled() {
    return !this._tracking;
  }

  addPt(pt) {
    this.map.addPolylineSync({
      points: [this.ptOld, pt],
      color: '#AA00FF',
      width: 5,
      geodesic: true,
    });  
    this.ptOld = pt;
    this.pts.push(pt);
    if (this.pts.length > 10) {
      var ptsCopy = [...this.pts];
      this.pts = [];
      this.glob.post("/add_track_data", {track_uuid: this.track_uuid, track_data: ptsCopy});
    }
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      zoom: 2,
      tilt: 30
    });
  }

  async tracking() {
    this._tracking = true;

    this.getPosCount = 0;
    this.getPosTime = 0;
    this.getPosMs = 0;
    this.map.clear();

    await this.glob.presentLoading("Obtaining position...");
    try {
      var resp = await this.geoloc.getCurrentPosition();
      this.ptOld = {lat: resp.coords.latitude, lng: resp.coords.longitude};
      this.map.animateCamera({target: this.ptOld, zoom: 16, tilt: 30});  
      this.bLocWorks = true;
      this.glob.dismissLoading();
    }
    catch(error) {
      this.glob.showToast('Error getting location, error: ' + error);
      this._tracking = false;
      this.glob.dismissLoading();
      return;
     }

    const modal = await this.modalCtrl.create({
      component: AddTrackPage,
      cssClass: 'auto-height'
    });
    await modal.present();  
    var ret = await modal.onDidDismiss();  
    if (null != ret.data) {
      this.track_uuid = GlobService.generate_UUID();
      try {
        await this.glob.post("/add_track", {track_name:ret.data, track_uuid: this.track_uuid});

        // if we r here, then adding track was successful
        this.pts = [];

        // add first point to map
        this.addPt(this.ptOld);

        this.startTime = new Date().getTime() / 1000;
        this.events = 0;
        this.eventsAdded = 0;

        this.backgroundMode.on('activate').subscribe(function() {
          this._bkMode = true;
          this.backgroundMode.disableWebViewOptimizations();
        }.bind(this));        
        this.backgroundMode.on('deactivate').subscribe(function() {
          this._bkMode = false;
        }.bind(this));        

        //this.watchPosition();
        this.startBgTracking();
      }
      catch(error) {
        this._tracking = false;
        this.glob.showToast(error.body);
      }
    }
    else {
      this._tracking = false;
    }
  }

  async watchPosition() {
    console.log("watching pos in foreground mode");
    await this.obtainPosition();
    if (this._tracking)
      setTimeout(this.watchPosition.bind(this), 3000);
  }

  async obtainPosition() {
    var timeGetPos = new Date().getTime();
    var geoPos = await this.geoloc.getCurrentPosition({enableHighAccuracy: true });
    console.log("geopos obtained");
    this.getPosTime += new Date().getTime() - timeGetPos;
    this.getPosCount++;
    this.getPosMs = Math.round(this.getPosTime / this.getPosCount);

    this.timeElapsed = Math.round(new Date().getTime() / 1000 - this.startTime);
    this.events++;
    var pt = {lat: geoPos.coords.latitude, lng: geoPos.coords.longitude};
    if (this.glob.distanceInM(this.ptOld.lat, this.ptOld.lng, pt.lat, pt.lng) > 3) {
      this.addPt(pt);
      this.eventsAdded++;
    }
  }

  stop() {
    //this.foregroundService.stop();
    this._tracking = false;

    window.navigator.geolocation.clearWatch( this.watch );
    this.watchSubscr.unsubscribe();

    this.glob.post("/add_track_data", {track_uuid: this.track_uuid, track_data: this.pts});
  }

  trackFill() {
    return (this._tracking) ? "clear" : "solid";
  }

  stopFill() {
    return (!this._tracking) ? "clear" : "solid";
  }  
 
  
  async startBgTracking() {
    this.getPosCount = 0;
    this.getPosTime = 0;
    this.getPosMs = 0;
    this.events = 0;
    this.eventsAdded = 0;
    this.map.clear();

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10, 
      debug: false,
      interval: 2000 
    };

    try {
      await this.backgroundGeolocation.configure(config);
      this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
        console.log('bg location event' + location);
        this.events++;
        var pt = {lat: location.latitude, lng: location.longitude};
        if (this.glob.distanceInM(this.ptOld.lat, this.ptOld.lng, pt.lat, pt.lng) > 3) {
          this.addPt(pt);
          this.eventsAdded++;
        }

        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        //this.backgroundGeolocation.finish(); // FOR IOS ONLY
      });
    }
    catch(err) {
      console.log(err);
    };

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
  }

  stopBgTracking() {
    console.log('stop Bg Tracking');
    this._tracking = false;
    this.backgroundGeolocation.stop();
    this.glob.post("/add_track_data", {track_uuid: this.track_uuid, track_data: this.pts});
  }

  startWatch() {
    this.getPosCount = 0;
    this.getPosTime = 0;
    this.getPosMs = 0;
    this.events = 0;
    this.eventsAdded = 0;
    this.map.clear();

    let options = {
      //frequency: 5000, 
      enableHighAccuracy: true
    };
  
    this.watch = this.geoloc.watchPosition(options).subscribe(function(position: Geoposition) {
      console.log('watch position ' + position);
  
      this.timeElapsed = Math.round(new Date().getTime() / 1000 - this.startTime);
      this.events++;
      var pt = {lat: position.coords.latitude, lng: position.coords.longitude};
      if (this.glob.distanceInM(this.ptOld.lat, this.ptOld.lng, pt.lat, pt.lng) > 5) {
        this.addPt(pt);
        this.eventsAdded++;
      }
    }.bind(this));
  }

  stopWatch() {
    console.log('stop watch');
    this.watch.unsubscribe();
  }
}
