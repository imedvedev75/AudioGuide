import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { GoogleMap, GoogleMaps, Geocoder, GeocoderResult, Marker, LatLngBounds, LatLng, GoogleMapsEvent, HtmlInfoWindow, Circle, ILatLng, PolylineOptions, Polyline } from '@ionic-native/google-maps';
import { Platform, ModalController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Constants } from '../constants.service';
import { GlobService } from '../glob.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { EditPlacePage } from '../edit-place/edit-place.page';
import { ActivatedRoute } from '@angular/router';
import { stringify } from 'querystring';
import { ReorderPlacesPage } from '../reorder-places/reorder-places.page';
import { DBStorageService } from '../dbstorage.service';
declare var google: any;
 
class PlaceInfo {
  public name: string = "";
  public images: string[] = [];
  place_id: string = "";
  pt: ILatLng = null;
  audioFile = "";
  //circle: Circle = null;
  //marker: Marker = null;

  constructor() {};
  public async init(info, pt, id) {
    this.name = info.name;
    //if (info.images) {
    //    this.images.push(await info.photos[0].getUrl());
    //}
    this.place_id = id;
    this.pt = pt;
  }
}

@Component({
  selector: 'app-create-guide',
  templateUrl: './create-guide.page.html',
  styleUrls: ['./create-guide.page.scss'],
})
export class CreateGuidePage implements OnInit {

  map: GoogleMap;
  autocomplete: any;
  searchText: string;
  @ViewChild('searchField') public searchField: any;
  @ViewChild('map_canvas') public map_canvas: any;
  @ViewChild('dummy') public dummy: any;
  @ViewChild('info') public infoField: any;
  @ViewChild('linesDiv') public linesDiv: any;
  searchBox: any;
  placeService: any;
  marker: Marker;
  hideInfo: boolean = true;
  drawLinesStyle = "";
  
  currInfo: PlaceInfo = new PlaceInfo();
  guide;
  circles = [];
  markers = [];
  myLines = [];
  currPlace = -1;
  guide_uuid: string;

  drawLines: boolean = false;
  linesToolbar: boolean = false;
  currLine: Polyline;
  currLinePts = [];
  iSelLine = -1;
  prevPoint;
  lastPoint;
  drawing: boolean = false;
  inDrawMove: Promise<any> | false = false;

  constructor(private platform: Platform,
    private storage: Storage,
    private glob: GlobService,
    private geoloc: Geolocation,
    private zone: NgZone,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private menu: MenuController,
    private db: DBStorageService) { }

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();
    await this.setupSearchBox();

    this.guide = await this.db.getGuide(this.route.snapshot.paramMap.get('uuid'), this.route.snapshot.paramMap.get('mode'));

    await this.loadData();

    this.searchText = await this.storage.get('searchStr');
  }

  async loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      zoom: 2,
      tilt: 30
    });

    this.map.on(GoogleMapsEvent.POI_CLICK).subscribe(this.poiClicked.bind(this));
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(this.mapClicked.bind(this));
    this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe(this.mapLongClicked.bind(this));

    try {
      var resp = await this.geoloc.getCurrentPosition();
      this.map.moveCamera({target: {lat: resp.coords.latitude, lng: resp.coords.longitude}, zoom: 16, tilt: 30});  
    }
    catch(err) {
      console.log(err);
      this.map.moveCamera({target: {lat: 49.299106, lng: 8.643835}, zoom: 16, tilt: 0});  
    }
  }

  async mapLongClicked(params: any[]) {
    let pt = params[0];
    let new_place_name = await this.glob.inputValue('Add New Place', 'Place Name');
    if (!new_place_name)
      return;

    // add new place
    this.currInfo = new PlaceInfo();
    this.currInfo.name = new_place_name;
    this.currInfo.place_id = GlobService.generate_UUID();
    this.currInfo.pt = pt;

    this.addPlace();
  }

  mapClicked(params: any[]) { 
    this.zone.run(() => {  
      this.hideInfo = true;
      this.selectLine(-1);
    });
  }

  async poiClicked(params: any[]) {
    let id: string = params[0];
    let pt = params[2];
    
    for (let i = 0; i < this.guide.places.length; i++) {
      if (this.guide.places[i].place_id == id) {
        this.zone.run(() => {  
          this.selectPlace(i);  
        });
        return;
      }
    }

    this.selectPlace(-1);

    this.placeService = new google.maps.places.PlacesService(this.dummy.nativeElement);

    var request = {
      placeId: id,
      fields: ['name']
    };

    this.placeService.getDetails(request, function(res, status) {
      this.zone.run(async function() {
        this.currInfo = new PlaceInfo();
        await this.currInfo.init(res, pt, id);
        this.showInfoWindow(res, pt);
      }.bind(this))
    }.bind(this));
  }

  showInfoWindow() {
    if (!this.marker) {
      this.marker = this.map.addMarkerSync({'position': this.currInfo.pt});
    }
    this.marker.setPosition(this.currInfo.pt);
    this.hideInfo = false;
  }

  disableAdd() {
    return this.currPlace != -1;
  }

  async loadData() { 
    var bounds = new LatLngBounds([]);
    for(let i=0; i<this.guide.places.length; i++) {
      let place = this.guide.places[i];
      this.circles.push(this.addCircle(place, false));
      this.markers.push(this.addMarker(i));
      bounds.extend(place.pt);
    };

    this.guide.lines.forEach(function (linePts) {
      this.myLines.push(this.addLine(linePts, true));
      linePts.forEach((pt) => {bounds.extend(pt);})
    }.bind(this));

    if (this.guide.places.length > 1) 
      this.map.moveCamera({target: bounds});  
    else if (this.guide.places.length == 1)
      this.map.moveCamera({target: this.guide.places[0].pt, zoom: 17});  
  }

  saveData() {
    this.db.saveOrUploadMyGuide(this.guide);
  }

  addPlace() { 
    this.guide.places.push(this.currInfo);
    this.circles.push(this.addCircle());
    this.markers.push(this.addMarker(this.guide.places.length-1));
    this.saveData();
    this.selectPlace(this.guide.places.length - 1);
    this.editPlace();
  }

  selectPlace(index) { 
    if (this.currPlace != -1) {
      this.circles[this.currPlace].setStrokeColor(Constants.COL_CIRCLE_NORM);
      this.circles[this.currPlace].setFillColor(Constants.COL_CIR_FILL_NORM);
    }
    this.currPlace = index;
    if (this.currPlace != -1) {
      this.circles[index].setStrokeColor(Constants.COL_CIRCLE_SEL);
      this.circles[index].setFillColor(Constants.COL_CIR_FILL_SEL);
      this.currInfo = this.guide.places[index];
      this.showInfoWindow();
    }
  }

  removePlace() {
    if (this.currPlace > -1) {
      //this.guide.places[this.currPlace].circle.remove();
      //this.guide.places[this.currPlace].marker.remove();
      //this.guide.places[this.currPlace].circle = null;
      this.guide.places.splice(this.currPlace, 1);
      this.circles[this.currPlace].remove();
      this.markers[this.currPlace].remove();
      this.circles.splice(this.currPlace, 1);
      this.markers.splice(this.currPlace, 1);
      this.currPlace = -1;
      this.saveData();
    }
  }

  reassignMarkers() {
    this.markers.forEach((marker) => { marker.remove(); });
    this.markers = [];
    for(let i=0; i<this.guide.places.length; i++) {
      this.markers.push(this.addMarker(i));
    }
  }

  addCircle(place = null, sel = true) {
    place = place ? place : this.currInfo;
    let circle: Circle = this.map.addCircleSync({
      'center': place.pt,
      'radius': 30,
      'strokeColor' : sel ? Constants.COL_CIRCLE_SEL : Constants.COL_CIRCLE_NORM,
      'strokeWidth': 2,
      'fillColor' : sel ? Constants.COL_CIR_FILL_SEL : Constants.COL_CIR_FILL_NORM,
      'clickable' : true,
      'place_id' : place.place_id
    });
    circle.on(GoogleMapsEvent.CIRCLE_CLICK).subscribe(this.onCircleClick.bind(this));
    return circle;
  }

  addMarker(i) {
    let marker: any = this.map.addMarkerSync({
      'position': this.guide.places[i].pt
    });
    marker.setIcon({
      'url': 'assets/icon/cg' + (i+1) + '.png',
      'size': {width: 24, height: 24},
      anchor: [12, 12]
    });
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(this.onMarkerClick.bind(this));
    return marker;
  }

  onCircleClick(params: any[]) {
    for (let i = 0; i < this.circles.length; i++) {
      if (this.circles[i] == params[1]) {
        this.zone.run(function() {
          this.selectPlace(i);  
        }.bind(this));
        return;
      }
    }
  }

  onMarkerClick(params: any[]) {
    for (let i = 0; i < this.markers.length; i++) {
      if (this.markers[i] == params[1]) {
        this.zone.run(function() {
          this.selectPlace(i);  
        }.bind(this));
        return;
      }
    }
  }

  async ionViewDidEnter() {
    //this.setupSearchBox();
  }

  async ionViewDidLeave() {
    this.storage.set('searchStr', this.searchText);
  }

  async setupSearchBox() {
    if (!google) { 
      setTimeout(this.setupSearchBox.bind(this), 1000);
    }
    var input = await this.searchField.getInputElement(); 
    this.searchBox = new google.maps.places.SearchBox(input); 
    this.searchBox.addListener('places_changed', this.placesChanged.bind(this))
  }

  placesChanged() {
    var places = this.searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      var place = places[0];
      var bounds = new LatLngBounds([]);
      if (place.geometry) {
        var latlng = new LatLng(place.geometry.location.lat(), place.geometry.location.lng());
        bounds.extend(latlng);
        if (place.geometry.viewport) {
          bounds.extend(new LatLng(place.geometry.viewport.na.j, place.geometry.viewport.ga.j));
          bounds.extend(new LatLng(place.geometry.viewport.na.l, place.geometry.viewport.ga.l));
        }
      }
      
      this.moveToPosition(bounds);
  }

  moveToPosition(latlng: LatLngBounds){
    this.map.animateCamera({target: latlng, tilt: 30}); 
  }

  async editPlace() {
    if (this.currInfo && this.currInfo.place_id) {
      const modal = await this.modalCtrl.create({
        component: EditPlacePage,
        cssClass: 'my-custom-modal-css',
        componentProps: {guide: this.guide, place: this.currInfo}
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      this.currInfo = data;
      this.saveData();
    }
    else {
      this.glob.showToast('Place Id is empty! ');
    }
  }

  clickList(place) {
    this.selectPlace(this.guide.places.indexOf(place));
  }

  dblClkList(place) {
    this.editPlace();
  }

  async testEditPlace() {
    const modal = await this.modalCtrl.create({
      component: EditPlacePage,
      cssClass: 'my-custom-modal-css',
      componentProps: {place_id: "123"}
    });
    modal.present();  
  }

  btnLinesClicked() {
    this.linesToolbar = !this.linesToolbar;
  }

  hideLinesToolbar() {
    return !this.linesToolbar;
  }

  drawLinesClick() {
    this.drawLines = !this.drawLines;
    this.drawLinesStyle = this.drawLines ? 'btn_pressed' : "";
  }

  /*
  drawLinesStyle() {
    return this.drawLines ? 'btn_pressed' : "";
  }
  */

  help() {}

  linesClick() {
    //console.log('lines div clicked')
  }

  addLine(pts, clickable) {
    let options: PolylineOptions = {
      points: pts, 
      color: Constants.COL_LINE_NORM,
      width: 5,
      geodesic: true,
      clickable: clickable
    };    
    let line = this.map.addPolylineSync(options);
    if (clickable)
      line.on(GoogleMapsEvent.POLYLINE_CLICK).subscribe(this.onLineClick.bind(this));
    return line;
  }

  onLineClick(params: any[]) {
    this.zone.run(function() {
      this.selectLine(this.myLines.indexOf(params[1]))
    }.bind(this));
  }

  selectLine(i) {
    // unselect selected line
    this.zone.run(function() {
      if (-1 != this.iSelLine)
        this.myLines[this.iSelLine].setStrokeColor(Constants.COL_LINE_NORM);
      this.iSelLine = i;
      if (-1 != i) {
        this.myLines[i].setStrokeColor(Constants.COL_LINE_SEL);
      }
    }.bind(this));
  }  

  hideDelLine() {
    return -1 == this.iSelLine;
  }

  disableDelLineBtn() {
    return -1 == this.iSelLine;
  }

  selLine() {
    if (this.iSelLine == this.myLines.length-1)
      this.selectLine(0);
    else
    this.selectLine(this.iSelLine + 1);
  }

  delLine() {
    if (-1 == this.iSelLine)
      return;

    this.myLines[this.iSelLine].remove();
    this.myLines.splice(this.iSelLine, 1);
    this.guide.lines.splice(this.iSelLine, 1);
    this.iSelLine = -1;
    this.saveData();
  }

  delAllLines() {
    this.myLines.forEach((el) => {
      el.remove();
    });
    this.myLines = [];
    this.guide.lines = [];
    this.iSelLine = -1;
    this.saveData();
  }  

  async mdLines(e) {
    await this.drawStart([e.offsetX, e.offsetY]);
  }

  async drawStart(pt) {
    this.prevPoint = await this.map.fromPointToLatLng(pt);
    this.drawing = true;
  }

  async muLines(e) {
    await this.drawEnd();
  }

  async drawEnd() {;
    this.drawing = false;
    await this.inDrawMove;
    if (!this.currLine)
      return;

    this.currLine.setClickable(true);
    this.currLine.on(GoogleMapsEvent.POLYLINE_CLICK).subscribe(this.onLineClick.bind(this));
    this.myLines.push(this.currLine);
    this.guide.lines.push([this.currLine.getPoints().getAt(0), this.currLine.getPoints().getAt(1)]);
    this.currLine = null;
    this.selectLine(this.myLines.length - 1);

    this.saveData();
  }

  async mmLines(e) {
    await this.drawMove([e.offsetX, e.offsetY]);
  }

  async drawMove(point) {
    if (!this.drawing)
      return;
    
    if (this.inDrawMove)
      return;
    this.inDrawMove = (async function() {
      try {
        let pt = await this.map.fromPointToLatLng(point);
        if (this.currLine) {
          this.currLine.remove();
        }
        this.currLine = this.addLine([this.prevPoint, pt], false);
        this.lastPoint = pt;
      }
      finally {
        this.inDrawMove = false;
      }
    }.bind(this))();
  }

  async touchStart(e) {
    let offset = this.linesDiv.nativeElement.getBoundingClientRect().top;
    await this.drawStart([e.touches[0].clientX, e.touches[0].clientY - offset]);
  }

  async touchEnd(e) {
    await this.drawEnd();
  }

  async touchMove(e) { 
    let offset = this.linesDiv.nativeElement.getBoundingClientRect().top;
    await this.drawMove([e.touches[0].clientX, e.touches[0].clientY - offset]);
  }

  async btnPlacesListClicked() {
    const modal = await this.modalCtrl.create({ 
      component: ReorderPlacesPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        places: this.guide.places.map(function callback(cv, i, a) { return cv.name }),
        callback: this.reorderPlaces.bind(this)
      }
    });
    modal.present();
    await modal.onDidDismiss();
    // redraw markers
    this.reassignMarkers();
    this.saveData();
  }

  reorderPlaces(from, to) {
    var b = this.guide.places[to];
    this.guide.places[to] = this.guide.places[from];
    this.guide.places[from] = b;
  }

  hideLinesMobile() {
    return !this.drawLines || !this.platform.is("mobile");
  }

  hideLinesDesktop() {
    return !this.drawLines || !this.platform.is("desktop");
  }
}
