import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Constants, WDF_GEOPOS } from '../constants.service';
import { GlobService } from '../glob.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DBStorageService } from '../dbstorage.service';
import { SERVER_URL } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { load } from '@angular/core/src/render3';


@Component({
  selector: 'app-guides',
  templateUrl: './guides.page.html',
  styleUrls: ['./guides.page.scss'],
})
export class GuidesPage implements OnInit {

  guides = [];
  searchText: string;
  myGeoLoc = WDF_GEOPOS;
  mode;

  constructor(private navCtrl: NavController,
    private storage: Storage,
    public glob: GlobService,
    private db: DBStorageService,
    private route: ActivatedRoute,
    private file: File) { }

  async ngOnInit() {
    await this.db.ready;
    this.mode = this.route.snapshot.paramMap.get('mode');
    this.myGeoLoc = await this.glob.getMyGeopos();

    this.load();
  }

  async load() {
    this.guides = [];

    if ('2' == this.mode) {
      for(let i=0; i<this.db.downGuides.length; i++) {
        let guide = await this.db.getGuideOffline(this.db.downGuides[i]);
        let searchText = this.searchText ? this.searchText.toLowerCase() : null;
        if (searchText)
          if (guide.guide_name.toLowerCase().includes(searchText) || guide.description.toLowerCase().includes(searchText))
            this.guides.push(guide);
        else 
          this.guides.push(guide);
      }
    }
    else {
      try {
        this.guides = <any[]>await this.glob.post('/get_guides', {searchText: this.searchText});
      }
      catch(err) {// guides have not been loaded
      }

      if (this.guides.length > 0) { // means we've got guides from server
        for(let i=0; i<this.guides.length; i++) {
          let g = this.guides[i];
          if (this.db.downGuides.indexOf(g.guide_uuid) >= 0) {
            g.mode = 2;
          }
        };
      }
      else {
        for(let i=0; i<this.db.downGuides.length; i++) {
          let guide_uuid = this.db.downGuides[i];
          this.guides.push(await this.db.getGuideOffline(this.db.downGuides[i]));
        }
      }
    }
 
    if (this.myGeoLoc) {
      this.guides.forEach(e => {
        if (e.places.length > 0) {
          e.distance = this.glob.distanceInKM(this.myGeoLoc.lat, this.myGeoLoc.lng, e.places[0].pt.lat, e.places[0].pt.lng);
        }
      });
      //sort
      this.guides.sort(function compare( a, b ) {
        if ( a.distance < b.distance)
          return -1;
        if ( a.distance > b.distance )
          return 1;
        return 0;
      });
    }
  }

  click(guide) {
    this.navCtrl.navigateForward(['/guide-details', guide.guide_uuid, 2]);
  }

  showDelGuide() {
    return 2==this.mode;
  }

  deleteDownGuide(guide) {
    this.db.deleteDownGuide(guide.guide_uuid);
    for(let i=0; i<guide.images.length; i++) {
      console.log('removing file: ' + guide.images[i]);
      this.file.removeFile(this.file.dataDirectory, guide.images[i]);
    };
    console.log('removing file: ' + guide.audioFile);
    this.file.removeFile(this.file.dataDirectory, guide.audioFile);
    //todo: delete all places 
    console.log('downloaded guide removed');      
    this.load();
  }  

  searchEnter() {
    this.load();    
  }

  searchClear() {
    this.searchText = "";
    this.load();
  }
}
