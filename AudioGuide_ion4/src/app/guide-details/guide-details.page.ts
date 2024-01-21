import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DBService } from '../db.service';
import { DBStorageService } from '../dbstorage.service';
import { GlobService } from '../glob.service';
import { GUIDE_DETAILS_EMPTY } from '../constants.service';
import { NavController, LoadingController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-guide-details',
  templateUrl: './guide-details.page.html',
  styleUrls: ['./guide-details.page.scss'],
})
export class GuideDetailsPage implements OnInit {

  @ViewChild('myaudio') audio: any;
  guide = GUIDE_DETAILS_EMPTY;
  hideAudio = false;
  mode;

  constructor(private route: ActivatedRoute,
    private db: DBStorageService,
    private glob: GlobService,
    private navCtrl: NavController,
    private file: File,
    private loadingController: LoadingController,
    private zone: NgZone) { }

  async ngOnInit() {
    let guide_uuid = this.route.snapshot.paramMap.get('id');
    //this.mode = this.route.snapshot.paramMap.get('mode');
    this.mode = this.db.downGuides.indexOf(guide_uuid) >= 0 ? 2 : 1;

    this.guide = await this.db.getGuide(guide_uuid, this.mode);
    if (this.guide.audioFile) {
      this.audio.nativeElement.src = this.glob.getFileURL(this.guide.audioFile, this.guide.guide_uuid, this.guide.mode);  
    }
    else {
      this.hideAudio = true;
    }
  }

  start() {
    this.navCtrl.navigateForward(['/guide', this.guide.guide_uuid, this.mode]);
  }

  async downloadGuide() {
    const loading = await this.loadingController.create({
      message: 'Downloading guide...',
    });
    await loading.present();  

    try {
      for(let i=0; i<this.guide.images.length; i++) {
        let image = this.guide.images[i];
        loading.message = 'Downoading guide image ' + i;
        await this.glob.downloadFile(this.glob.getServerFileUrl(image, this.guide.guide_uuid), image);
      }; 
      if (this.guide.audioFile) {
        loading.message = 'Downoading guide audio';
        await this.glob.downloadFile(this.glob.getServerFileUrl(this.guide.audioFile, this.guide.guide_uuid), this.guide.audioFile);
      }

      //places
      for(let j=0; j<this.guide.places.length; j++) {
        loading.message = 'Downoading place ' + j;
        let place = this.guide.places[j];
        console.log('downloading place: ' + place.name);
        for(let i=0; i<place.images.length; i++) {
          let image = place.images[i];
          await this.glob.downloadFile(this.glob.getServerFileUrl(image, this.guide.guide_uuid), image);
        }; 
        if (place.audioFile) {
          await this.glob.downloadFile(this.glob.getServerFileUrl(place.audioFile, this.guide.guide_uuid), place.audioFile);  
        }
      }

      this.db.addDownGuide(this.guide.guide_uuid);
      this.guide.mode = '2';
      this.db.saveGuide(this.guide);
    }
    catch(err) {console.log('error downloading guide: ' + JSON.stringify(err))}
    finally {loading.dismiss();}

    //this.glob.downloadFile(this.guide.images[0])
  }
}
