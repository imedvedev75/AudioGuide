import { Component, NgZone } from '@angular/core';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { GoogleMap, GoogleMaps, Marker, Circle, PolylineOptions } from '@ionic-native/google-maps';
import { GlobService } from '../glob.service';
import { ActivatedRoute } from '@angular/router';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse, BackgroundGeolocationEvents } from '@ionic-native/background-geolocation/ngx';
import { Constants, GUIDE_DETAILS_EMPTY } from '../constants.service';
import { PlacePage } from '../place/place.page';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LatLngBounds, GoogleMapsEvent } from '@ionic-native/google-maps/ngx';
import { WDF, WDF_LINES } from './dataWdf';
import { DBStorageService } from '../dbstorage.service';

@Component({
  selector: 'app-guide',
  templateUrl: 'guide.page.html',
  styleUrls: ['guide.page.scss']
})
export class GuidePage {

  public img: any;
  public enableSim = false;
  
  map: GoogleMap;
  private ind = 0;
  private posMarker;
  private curr_obj = -1;
  guide = GUIDE_DETAILS_EMPTY;
  markers = [];
  myLines = [];
  
  constructor(private nativeAudio: NativeAudio,
    private glob: GlobService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private backgroundGeolocation: BackgroundGeolocation,
    private storage: Storage,
    private modalCtrl: ModalController,
    private db: DBStorageService) {
    
  }

  async ngOnInit() {
    this.guide = await this.db.getGuide(this.route.snapshot.paramMap.get('id'), this.route.snapshot.paramMap.get('mode'));
    
    await this.loadMap();  
    await this.loadGuide();

    this.start();
  }

  async ionViewDidLeave() {
    this.stop();
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      zoom: 2,
      tilt: 30
    });
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(this.mapClicked.bind(this));
  }

  mapClicked(params: any[]) { 
    console.log(params[0]);
  }

  async loadGuide() {
    var bounds = new LatLngBounds([]);
    for (let i=0; i<this.guide.places.length; i++) {
      this.addMarker(i);
      bounds.extend(this.guide.places[i].pt);
    };

    this.addLines();

    if (this.guide.places.length > 0) 
      this.map.moveCamera({target: bounds});  
  }

  addLines() {
    for (let i=0; i<this.guide.lines.length; i++) {
      let options: PolylineOptions = {
        points: this.guide.lines[i],
        color: '#AA00FF',
        width: 5,
        geodesic: true,
        clickable: true
      };      
      this.map.addPolylineSync(options);
    } 
  }

  addMarker(i) {
    let marker = this.map.addMarkerSync({
      'position': this.guide.places[i].pt
    });
    this.markers.push(marker);
    marker.setIcon({
      'url': 'assets/icon/' + (i+1) + '.png',
      'size': {width: 36, height: 36}
    })
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(this.onMarkerClick.bind(this));
  }

  onMarkerClick(params: any[]) {
    this.tellAboutPlace(this.markers.indexOf(params[1]));  
  }

  async startSim() {
    this.ind = 0;
    this.checkPos(this.guide.places[0].pt);
  }

  stepFw() {
    if (this.ind < this.guide.places.length - 1)
      this.ind++;
    this.checkPos(this.guide.places[this.ind].pt);
  }

  stepBk() {
    if (this.ind > 0)
      this.ind--;
    this.checkPos(this.guide.places[this.ind].pt);
  }

  async checkPos(pt) {
    // add marker
    if (!this.posMarker) 
      this.posMarker = await this.map.addMarker({
        'position': pt,
        'icon': 'assets/icon/walking.png'
      })    
    this.posMarker.setPosition(pt);
    for (var i = 0; i < this.guide.places.length; i++) { 
      let pt2 = this.guide.places[i].pt;
      if (this.glob.distanceInM(pt.lat, pt.lng, pt2.lat, pt2.lng) < 30) {
        if (i != this.curr_obj) {
          // (new) object to play found
          this.curr_obj = i;
          this.tellAboutPlace(i);
        }
      }
    }
  }

  async tellAboutPlace(i) {
    const modal = await this.modalCtrl.create({
      component: PlacePage,
      cssClass: 'my-custom-modal-css',
      componentProps: {guide: this.guide, place: this.guide.places[i]}
    });
    modal.present();  
  }

  async start() {

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 10,
      distanceFilter: 5, 
      debug: false,
      interval: 2000,
      stopOnTerminate: true
    };

    try {
      await this.backgroundGeolocation.configure(config);
      console.log('Bk geo config success');
      this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
        this.zone.run(() => {
          console.log('bg location event' + location);
          var pt = {lat: location.latitude, lng: location.longitude};
          this.checkPos(pt);
        });                  
      });
    }
    catch(err) {
      console.log('Bk Geo configure error: ' + err);
      //this.glob.showToast('Bk Geo configure error: ' + err);
    };

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
  }

  stop() {
    this.backgroundGeolocation.stop();
  }

  sim() {
    this.enableSim = !this.enableSim;
  }
}

