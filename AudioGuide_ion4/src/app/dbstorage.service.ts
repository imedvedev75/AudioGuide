import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ThrowStmt } from '@angular/compiler';
import { Constants, GUIDE_DETAILS_EMPTY } from './constants.service';
import { GlobService } from './glob.service';


const MYGUIDES = "MYGUIDES";
const DOWNLOADEDGUIDES = "DOWNLOADEDGUIDES";

@Injectable({
  providedIn: 'root'
})
export class DBStorageService {

  public myGuides = [];
  public downGuides = [];
  public ready: Promise<any>;

  constructor(private storage: Storage,
    private glob: GlobService) {
      this.ready = this.init();
  }

  async init() {
    this.myGuides = await this.getMyGuides();
    this.downGuides = await this.getDownGuides();
  }

  async getMyGuides() {
    let guides = JSON.parse(await this.storage.get(MYGUIDES));
    return guides ? guides : [];
  }

  addMyGuide(guide) {
    this.myGuides.push(guide);
    this.saveMyGuides();
  }

  deleteMyGuide(guide) {
    this.myGuides.splice(this.myGuides.indexOf(guide), 1);
    this.saveMyGuides();
  }

  private saveMyGuides() {
    this.storage.set(MYGUIDES, JSON.stringify(this.myGuides));
  }

  async getDownGuides() {
    let guides = JSON.parse(await this.storage.get(DOWNLOADEDGUIDES));
    return guides ? guides : [];
  }

  addDownGuide(guide_uuid) {
    //this.downGuides = [];
    if (-1 == this.downGuides.indexOf(guide_uuid))
      this.downGuides.push(guide_uuid);
    this.saveDownGuides();
  }

  deleteDownGuide(guide_uuid) {
    this.downGuides.splice(this.downGuides.indexOf(guide_uuid), 1);
    this.saveDownGuides();
  }

  saveDownGuides() {
    this.storage.set(DOWNLOADEDGUIDES, JSON.stringify(this.downGuides));
  }

  async getGuideName(guide_uuid) {
    let guides = JSON.parse(await this.storage.get(MYGUIDES));
    for (let i=0; i<guides.length; i++) {
      if (guide_uuid == guides[i].guide_uuid) {
        return guides[i].guide_name;
      }
    }
    return "";
  }

  async getGuide(guide_uuid, mode) {
    if ('1' == mode) {
      return await this.getGuideOnline(guide_uuid);
    }
    else {
      return await this.getGuideOffline(guide_uuid);
    }
  }

  getGuideOnline(guide_uuid) {
    return this.glob.post('/get_guide', {guide_uuid: guide_uuid});
  }

  async getGuideOffline(guide_uuid) {
    let guide_details = JSON.parse(await this.storage.get(guide_uuid));
    return guide_details ? guide_details : GUIDE_DETAILS_EMPTY;
  }

  async saveOrUploadMyGuide(guide) {
    if ('1' == guide.mode) {
      await this.uploadMyGuide(guide);
    }
    else {
      this.saveGuide(guide);
    }
  }

  async uploadMyGuide(guide) {
      //this.glob.presentLoading('uploading guide...');
      try {
        await this.glob.post('/upload_guide', guide);
      }
      catch(err){}
      //finally {this.glob.dismissLoading();}
  }

  saveGuide(guide) {
    this.storage.set(guide.guide_uuid, JSON.stringify(guide));
  }

  async getGuidePlaces(guide_uuid) {
    let myPlaces = JSON.parse(await this.storage.get(guide_uuid + '_places'));
    return (myPlaces) ? myPlaces : [];
  }

  async getGuideEditedPlaces(guide_uuid) {
    let ret = [];
    let myPlaces = JSON.parse(await this.storage.get(guide_uuid));
    myPlaces = (myPlaces) ? myPlaces : [];
    for(let i=0; i<myPlaces.length; i++) {
      let place = JSON.parse(await this.storage.get(myPlaces[i].place_id));
      place.pt = myPlaces[i].pt;
      ret.push(place);
    }
    return ret;
  }

  async getGuideLines(guide_uuid) {
    let lines = JSON.parse(await this.storage.get(guide_uuid + "_lines"));
    return (lines) ? lines : [];
  }


}
