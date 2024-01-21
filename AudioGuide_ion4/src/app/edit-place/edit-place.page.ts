import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavParams, ModalController } from '@ionic/angular';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureAudioOptions, CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { GlobService } from '../glob.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { Constants, GUIDE_DETAILS_EMPTY, PLACE_DETAILS_EMPTY } from '../constants.service';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx'
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DBStorageService } from '../dbstorage.service';

@Component({
  selector: 'app-edit-place',
  templateUrl: './edit-place.page.html',
  styleUrls: ['./edit-place.page.scss'],
})
export class EditPlacePage implements OnInit {

  public descriptionText: string;
  public enablePlayAudio: boolean = true;
  public disableRecord: boolean = false;

  @ViewChild('myaudio') audio: any;
  @ViewChild('myvideo') myVideo: any;
  @ViewChild("fileAudioPlace") fileAudio: ElementRef;
  @ViewChild("myInputPlace") myInput: ElementRef;
  @ViewChild("fileImagePlace") fileImage: ElementRef;
  @ViewChild("inputImagePlace") inputImage: ElementRef;  
  //placeId: string = "123";
  mediaObject: MediaObject;
  place = PLACE_DETAILS_EMPTY;
  guide = GUIDE_DETAILS_EMPTY;
  /* = {
    place_id: "123",
    place_name: "",
    description: "",
    images: [],
    audioFile: "",
    videoFile: ""
  }*/

  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(private navParam: NavParams,
    private modalCtrl: ModalController,
    private mediaCapture: MediaCapture,
    private glob: GlobService,
    private fileOpener: FileOpener,
    private file: File,
    private nativeAudio: NativeAudio,
    public media: Media,
    private storage: Storage,
    private camera: Camera,
    private transfer: FileTransfer,
    private db: DBStorageService) 
  { 
    /* 
    this.place.place_id = this.navParam.get('place_id');
    this.place.place_name = this.navParam.get('place_name');
    if (!this.place.place_id) {
      this.glob.showToast('Place Id is empty! ');
      this.modalCtrl.dismiss();
    }
    */
  }

  ngOnInit() {
    this.place = this.navParam.get('place'); 
    this.guide = this.navParam.get('guide'); 
    this.audio.nativeElement.src = this.glob.getFileURL(this.place.audioFile, this.guide.guide_uuid, this.guide.mode);   
  }

  close() {
    this.modalCtrl.dismiss(this.place);
  }

  async recordAudio() {
    let options: CaptureAudioOptions = { limit: 1 };
    try {
      this.place.audioFile = GlobService.generate_UUID() + '.mp3';
      await this.glob.downloadFile((await this.mediaCapture.captureAudio(options))[0].fullPath, this.place.audioFile);
      this.db.saveOrUploadMyGuide(this.guide);
      this.audio.nativeElement.src = this.glob.convertFileName(this.place.audioFile);
    }
    catch(err) {
      console.error(err);
    };
  }

  recordAudio2() {
    this.disableRecord = true;
    this.place.audioFile = GlobService.generate_UUID() + '.mp3';
    this.mediaObject = this.media.create(this.file.dataDirectory + this.place.audioFile);
    this.mediaObject.startRecord();
  }
 
  stopRec() {
    this.mediaObject.stopRecord();
    this.disableRecord = false;
    this.mediaObject.release();  
    this.saveOrUpload();
    this.audio.nativeElement.src = this.glob.convertFileName(this.place.audioFile);
  }

  async ionViewDidEnter() {
    //this.loadguide();
  } 

  async ionViewDidLeave() {
    this.saveOrUpload();
  } 

  async recordVideo() {
    let options: CaptureVideoOptions = { limit: 1 }
    try {
      let local_url = (await this.mediaCapture.captureVideo(options))[0]["localURL"];
      this.place.videoFile = await this.glob.downloadFile(local_url, GlobService.generate_UUID() + '.mp4');
      this.saveOrUpload();
      this.myVideo.nativeElement.src = this.glob.convertFileName(this.place.videoFile);
    }
    catch (err) {
      console.error('video capture error');
      console.error(err);
    }
  }  

  async shot2() {
    let options: CaptureImageOptions = { limit: 1 }
    try {
      let imageFile = (await this.mediaCapture.captureImage(options))[0].fullPath;
      this.place.images.push(imageFile);
      this.saveOrUpload();
    }
    catch (err) {
      console.error('image capture error');
      console.error(err);
    }
  }

  async loadImage() {
    let filename = GlobService.generate_UUID() + '.jpg';
    await this.glob.getImage(PictureSourceType.PHOTOLIBRARY, filename); 
    this.place.images.push(filename);
    this.saveOrUpload();
  }

  async shot() {
    let filename = GlobService.generate_UUID() + '.jpg';
    await this.glob.getImage(PictureSourceType.CAMERA, filename); 
    this.place.images.push(filename);
    this.saveOrUpload();
  }

  async playbackVideo() {
     this.fileOpener.open(this.place.videoFile, 'video/mp4');
  }

  convertFileName(filename) {
    try {
      return this.glob.convertFileName(filename);
    }
    catch(err) {
      console.log('Error converting filename: ' + filename + ', error: ' + JSON.stringify(filename) )
    }
  }

  browse() {
    this.myInput.nativeElement.click();
  }

  browseImage() {
    this.inputImage.nativeElement.click();
  }  

  async fileSelectedPlace(event) {
    if (0 == this.fileAudio.nativeElement.files.length) return;
    let filename = GlobService.generate_UUID() + '.mp3';
    await this.glob.uploadFileInt(this.fileAudio.nativeElement.files[0], this.guide.guide_uuid, filename);
    this.audio.nativeElement.src = this.glob.getServerFileUrl(filename, this.guide.guide_uuid);
    this.place.audioFile = filename;
    this.db.saveOrUploadMyGuide(this.guide);
  }

  saveOrUpload() {
    this.db.saveOrUploadMyGuide(this.guide);
  }

  async imgFileSelectedPlace(event) {
    if (0 == this.fileImage.nativeElement.files.length) return;
    let filename = GlobService.generate_UUID() + '.jpg';
    try {
      await this.glob.uploadFileInt(this.fileImage.nativeElement.files[0], this.guide.guide_uuid, filename);
    }
    catch(err) {
      return;
    }
    finally {
      this.fileImage.nativeElement.value = '';
    }
    this.place.images.push(filename);
    this.db.saveOrUploadMyGuide(this.guide);
  }

  async deleteImage(image) {
    this.place.images.splice(this.place.images.indexOf(image), 1);
    this.db.saveOrUploadMyGuide(this.guide);
    if ('1' == this.guide.mode) {
      await this.glob.post('/delete_file', {guide_uuid: this.guide.guide_uuid, file:image});
    }
    else {
      // todo: delete local file
    }
  }

}
