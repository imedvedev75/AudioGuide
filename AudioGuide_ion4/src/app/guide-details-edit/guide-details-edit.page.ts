import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GlobService } from '../glob.service';
import { PictureSourceType } from '@ionic-native/camera/ngx';
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { DBStorageService } from '../dbstorage.service';
import { CaptureAudioOptions, MediaCapture } from '@ionic-native/media-capture/ngx';
import { MediaObject, Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { GUIDE_DETAILS_EMPTY } from '../constants.service';


@Component({
  selector: 'app-guide-details-edit',
  templateUrl: './guide-details-edit.page.html',
  styleUrls: ['./guide-details-edit.page.scss'],
})
export class GuideDetailsEditPage implements OnInit {

  public disableRecord: boolean = false;

  @ViewChild('myaudio') audio: any;
  @ViewChild("fileAudio") fileAudio: ElementRef;
  @ViewChild("myInput") myInput: ElementRef;
  @ViewChild("fileImage") fileImage: ElementRef;
  @ViewChild("inputImage") inputImage: ElementRef;
  guide = GUIDE_DETAILS_EMPTY;
  mode;
  mediaObject: MediaObject;

  constructor(public glob: GlobService,
    private storage: Storage,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private db: DBStorageService,
    private mediaCapture: MediaCapture,
    public media: Media,
    private file: File,
    private loadingController: LoadingController) { }

  async ngOnInit() {
    let guide_uuid = this.route.snapshot.paramMap.get('id');
    this.mode = this.route.snapshot.paramMap.get('mode');
    this.guide = await this.db.getGuide(guide_uuid, this.mode);
    this.audio.nativeElement.src = this.glob.getFileURL(this.guide.audioFile, this.guide.guide_uuid, this.guide.mode);
  }

  async loadImage() {
    let filename = GlobService.generate_UUID() + '.jpg';
    await this.glob.getImage(PictureSourceType.PHOTOLIBRARY, filename); 
    this.guide.images.push(filename);
    this.saveOrUpload();
  }

  saveOrUpload() {
    this.db.saveOrUploadMyGuide(this.guide);
  }

  ionViewDidLeave() {
    this.saveOrUpload();
  }

  async shot() {
    let filename = GlobService.generate_UUID() + '.jpg';
    await this.glob.getImage(PictureSourceType.CAMERA, filename);  
    this.guide.images.push(filename);
    this.saveOrUpload();
  }

  async deleteImage(image) {
    if ('1' == this.guide.mode) {
      await this.glob.post('/delete_file', {guide_uuid: this.guide.guide_uuid, file:image});
    }
    else {
      //todo: delete image locally
    }
    this.guide.images.splice(this.guide.images.indexOf(image), 1);
    this.saveOrUpload();
  }

  editGuide() {
    this.saveOrUpload();
    this.navCtrl.navigateForward(['/create-guide', this.guide.guide_uuid, this.mode]);
  }

  async recordAudio() {
    let options: CaptureAudioOptions = { limit: 1 };
    try {
      let filename = GlobService.generate_UUID() + '.mp3';
      await this.glob.downloadFile((await this.mediaCapture.captureAudio(options))[0].fullPath, filename);
      this.guide.audioFile = filename;
      this.saveOrUpload();
      this.audio.nativeElement.src = this.glob.convertFileName(this.guide.audioFile);
    }
    catch(err) {
      console.error(err);
    };
  }

  recordAudio2() {
    this.disableRecord = true;
    this.guide.audioFile = GlobService.generate_UUID() + '.mp3';
    this.mediaObject = this.media.create(this.file.dataDirectory + this.guide.audioFile);
    this.mediaObject.startRecord();
  }

  stopRec() {
    this.mediaObject.stopRecord();
    this.disableRecord = false;
    this.mediaObject.release();  
    this.saveOrUpload();
    this.audio.nativeElement.src = this.glob.convertFileName(this.guide.audioFile);
  }

  loadAudio() {
    document.getElementById('file').click();
  }

  browse() {
    this.myInput.nativeElement.click();
  }

  browseImage() {
    this.inputImage.nativeElement.click();
  }

  async imgFileSelected(event) {
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
    this.guide.images.push(filename);
    this.saveOrUpload();
  }

  getImageURL(image) {
    if (this.glob.isMobile()) { 
      return this.glob.convertFileName(image);
    }
  }

  async fileSelected(event) {
    if (0 == this.fileAudio.nativeElement.files.length) return;
    let filename = GlobService.generate_UUID() + '.mp3';
    await this.glob.uploadFileInt(this.fileAudio.nativeElement.files[0], this.guide.guide_uuid, filename);
    this.audio.nativeElement.src = this.glob.getServerFileUrl(filename, this.guide.guide_uuid);
    this.guide.audioFile = filename;
    this.saveOrUpload();
  }

  async upload() {
    this.saveOrUpload();

    const loading = await this.loadingController.create({
      message: 'Uploading guide...',
    });
    await loading.present();    

    try {
      this.glob.post('/upload_guide', this.guide);

      for(let i=0; i<this.guide.images.length; i++) {
        loading.message = "Uploading image: " + (i+1);
        let image = this.guide.images[i];
        await this.glob.uploadFile(image, this.guide.guide_uuid);
      }
      loading.message = "Uploading audio";// + this.guide.audioFile;
      await this.glob.uploadFile(this.guide.audioFile, this.guide.guide_uuid);

      for(let j=0; j<this.guide.places.length; j++) {  
        loading.message = "Uploading place: " + (j+1);
        let place =this.guide.places[j];
        for(let i=0; i<place.images.length; i++) {
          let image = place.images[i];
          await this.glob.uploadFile(image, this.guide.guide_uuid);
        }
        await this.glob.uploadFile(place.audioFile, this.guide.guide_uuid);
      }
    }
    catch(err) {
      console.log('upload error: ' + JSON.stringify(err));
    }
    finally {
      loading.dismiss();
    }
  }

  fileImageHidden() {
    return this.glob.isMobile();
  }

  fileAudioHidden() {
    return this.glob.isMobile();
  }

  isMobile() {
    return this.glob.isMobile();
  }
}

