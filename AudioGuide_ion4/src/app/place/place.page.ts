import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { GlobService } from '../glob.service';
import { Storage } from '@ionic/storage';
import { PLACE_DETAILS_EMPTY, GUIDE_DETAILS_EMPTY } from '../constants.service';

@Component({
  selector: 'app-place',
  templateUrl: './place.page.html',
  styleUrls: ['./place.page.scss'],
})
export class PlacePage implements OnInit {

  placeId: string;
  @ViewChild('myvideo') myVideo: any;
  @ViewChild('myaudio') myaudio: any;
  @ViewChild('slides') slides: any;
  place = PLACE_DETAILS_EMPTY;
  guide = GUIDE_DETAILS_EMPTY
  @ViewChild('myaudio') audio: any;

  public slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  constructor(private navParam: NavParams,
    private storage: Storage,
    public glob: GlobService,
    private modalCtrl: ModalController,
    ) { }

  async ngOnInit() {
    this.place = this.navParam.get('place'); 
    this.guide = this.navParam.get('guide'); 
    this.audio.nativeElement.src = this.glob.getFileURL(this.place.audioFile, this.guide.guide_uuid, this.guide.mode); 
  }

  async loadData() {
    this.place = JSON.parse(await this.storage.get(this.placeId));
    //this.myVideo.nativeElement.src = this.place.videoFile //this.glob.convertFileName(this.place.videoFile);
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

  convertFileName(filename) {
      return this.glob.convertFileName(filename);
  }  

}
