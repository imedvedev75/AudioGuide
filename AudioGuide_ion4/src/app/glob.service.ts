import { Injectable, NgZone } from '@angular/core';
import { ToastController, LoadingController, AlertController, ModalController, Events, Platform } from '@ionic/angular';
import { SQLite, SQLiteDatabaseConfig } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from 'src/environments/environment';
import { InputValuePage } from './input-value/input-value.page';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { BrowseFilePage } from './browse-file/browse-file.page';
import { LoginPage } from './login/login.page';
import { Storage } from '@ionic/storage';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
import { TouchSequence } from 'selenium-webdriver';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { WDF_GEOPOS } from './constants.service';

@Injectable({
  providedIn: 'root'
})
export class GlobService {

  public currTab: number;
  public user;

  private browserFiles = {};
  private loading: any;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(private toastController: ToastController,
    private sqlite: SQLite,
    private aHttpClient: HttpClient,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private webview: WebView,
    public events: Events,
    private camera: Camera,
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform,
    private storage: Storage,
    private zone: NgZone,
    private geoloc: Geolocation) { 
      this.currTab = 0;
      this.init();
  }

  async init() {
    this.browserFiles = JSON.parse(await this.storage.get('BROWSER_FILES'));
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  distanceInM(lat1, lng1, lat2, lng2) {
    var earthRadiusM = 6371000;

    var dLat = this.degreesToRadians(lat2-lat1);
    var dLon = this.degreesToRadians(lng2-lng1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(earthRadiusM * c) ;
  }

  distanceInKM(lat1, lng1, lat2, lng2) {
    return Math.floor(this.distanceInM(lat1, lng1, lat2, lng2) / 1000);
  }

  async showToast(txt) {
    const alert = await this.toastController.create({
      message: txt,
      duration: 2000,
    });
    await alert.present();
  }

  async showAlert(txt, header="Info") {
    const alert = await this.toastController.create({
      header: header,
      message: txt,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToastWait(txt, header="Info") {
    const alert = await this.alertCtrl.create({
      header: header,
      message: txt,
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
  }  

  public static generate_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  } 

  async postArray(res, data) {
    var ret = await this.post(res, data);
    return Object.keys(ret).map(key => ret[key]);
  }

  async post(res, data, formData=false) {
    return new Promise( function(resolve, reject)  {
      let opts = formData ? {} : {withCredentials: true,
      observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'rejectUnauthorized': 'false' }};
      this.aHttpClient.post(SERVER_URL + res, data, opts).toPromise()
      .then( (ret) => {
        resolve(ret.body);
      })
      .catch( async function(err) {
        if (401 == err.status) {  //need to login
          if (await this.login()) {
            this.aHttpClient.post(SERVER_URL + res, data, opts).toPromise()
            .then( (ret) => resolve(ret.body))
            .catch( (err) => reject(err))
          }
          else {
            reject('not logged');
          }
        }
        else {        
          this.showToast(err.message);
          reject(err);
        }
      }.bind(this))
    }.bind(this)
   )
  }

  async postLogin(res, data, formData=false) {
    await this.check_login();
    return this.post(res, data, formData);
  }

  async login() {
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      //cssClass: "my-custom-modal-css"
      cssClass: 'auto-height'
    });
    await modal.present();
    let {data} = await modal.onDidDismiss();   
    return data;
   }

  async get_ext(res) {
    return new Promise( function(resolve, reject)  {
     this.aHttpClient.get(res, {withCredentials: true,
       observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'rejectUnauthorized': 'false' }})
       .toPromise()
       .then( function(ret) {
         resolve(ret.body);
       })
       .catch( function(err) {
         this.showToast(err.message);
         reject(err.message);
       }.bind(this))
     }.bind(this)
    )
   }

  
  async presentLoading(msg: string) {
    this.loading = await this.loadingController.create({
      message: msg
    });
    await this.loading.present();
  }

  dismissLoading() {
    this.loading.dismiss();
  }

  async inputValue(header, value_name) {
    const modal = await this.modalCtrl.create({
      component: InputValuePage,
      cssClass: 'auto-height',
      componentProps: {header: header, value_name: value_name}
    });
    await modal.present();  
    let ret = await modal.onDidDismiss();  
    return ret.data;
  }

  convertFileName(filename) {
    return this.webview.convertFileSrc(this.file.dataDirectory + filename);
  }

  async confirm(header, message) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Yes',
          role: 'yes',
        }, {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await alert.present();    
    var ret = await alert.onDidDismiss();
    return ret.role;
  }

  async getImage(sourceType, filename) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType,
      correctOrientation: true
    }
    
    let fileUri = await this.camera.getPicture(options);
    return await this.downloadFile(fileUri, filename); 
  }

  async copyFile(localURL) {
    localURL = decodeURI(localURL);
    let dir = localURL.split('/');
    let name = dir.pop();
    let fromDirectory = dir.join('/');      
    var toDirectory = this.file.dataDirectory;

    try {
      await this.file.copyFile(fromDirectory, name, toDirectory, name);
      return toDirectory + name;
    }
    catch(err) {
     this.showToast('error copying file: ' + localURL + "\n Error: " + JSON.stringify(err));
     console.log(err);
    };    
  }  

  async downloadFile(fileUri, filename) {
    fileUri = decodeURI(fileUri);
    //let name = fileUri.split('/').pop();
    var toDirectory = this.file.dataDirectory;

    try {
      await this.fileTransfer.download(fileUri, toDirectory + filename);
      return toDirectory + filename;
    }
    catch(err) {
     this.showToast('error copying file: ' + fileUri + "\n Error: " + JSON.stringify(err));
     console.log(err);
    };    
  }

  async browseFile() {
    const modal = await this.modalCtrl.create({
      component: BrowseFilePage,
      cssClass: 'my-custom-modal-css',
      componentProps: {}
    });
    await modal.present();  
    let ret = await modal.onDidDismiss();  
    return ret.data;
  }

  async uploadFile(file: any, guide_uuid) {
    if ('string' == typeof file) {
      return new Promise(async function(resolve, reject) {
        try {
          file = this.file.dataDirectory + file;
          let fileToUpload = await this.getFileFromUrl(file);
          await this.uploadFileInt(fileToUpload, guide_uuid);
          resolve();
        }
        catch(err) {
          console.log(err);
          reject(err);
        }
      }.bind(this));
    }
    else {
      return this.uploadFileInt(file, guide_uuid);
    }
  }

  async uploadFileInt(file: any, guide_uuid, filename?: string) {
      return new Promise(async function(resolve, reject) {
        const loading = await this.loadingController.create({
          message: 'Uploading file...',
        });
        await loading.present();

        try {
          const reader = new FileReader();
          reader.onloadend = async function() {
              const formData = new FormData();
              const imgBlob = new Blob([reader.result], {
                  type: file.type
              });
              formData.append('file', imgBlob, filename ? filename : file.name);
              formData.append('guide_uuid', guide_uuid);
              try {
                await this.post("/upload_file", formData, true);
                resolve();
              }
              catch(err) {
                reject(err);
              }
          }.bind(this);
          reader.readAsArrayBuffer(file);
        }
        catch(err) {
          this.showToast('File upload failed. ' + JSON.stringify(err));
          reject(err);
        }
        finally {
          loading.dismiss();
        }
      }.bind(this));
  }

  getUrlFromFile(file) {
    return new Promise<string>(function(res, rej) {
      let reader = new FileReader();

      reader.onload = (event:any) => {
        res(event.target.result);
      }
      reader.readAsDataURL(file);
    });
  }

  getFileFromUrl(url) {
    return new Promise(async function(resolve, reject) {
      try {
        let entry = await this.file.resolveLocalFilesystemUrl(url);
        ( < FileEntry > entry).file(function(file) {
            resolve(file);
        }.bind(this));
      }
      catch(err) {
        reject(err);
      }
    }.bind(this));
  }

  async check_login() { 
    try {
      await this.post('/check_login', {});
    }
    catch(err) {
      if (401 == err.status) {  //need to login
        if (await this.login())
          return;
      }
      throw(err);
    };
  }

  isMobile() {
    if (this.platform.is('mobile'))
      return true;
    return false;
  }

  getFileURL(image, guide_uuid, mode) {
    if (!image)
      return '';
    if ('2' == mode) { 
      return this.convertFileName(image);
    }
    else {
      return this.getServerFileUrl(image, guide_uuid);
    }
  }

  getServerFileUrl(filename, guide_uuid) {
    return SERVER_URL + '/data/' + guide_uuid + '/' + filename;
  }

  async addBrowserFile(filename, file) {
    this.browserFiles[filename] = [await this.getUrlFromFile(file), file];
    this.storage.set('BROWSER_FILES', JSON.stringify(this.browserFiles));
  }

  deleteBrowserFile(filename) {
    delete this.browserFiles[filename];
    this.storage.set('BROWSER_FILES', JSON.stringify(this.browserFiles));
  }

  async getMyGeopos() {
    try {
      await this.presentLoading('Obtaining your geoposition...');
      var resp = await this.geoloc.getCurrentPosition();
      return {lat: resp.coords.latitude, lng: resp.coords.longitude};
    }
    catch(err) {
      this.showToast('Geoposition is not detected.')
    }
    finally {
      this.dismissLoading();
    }    

    return WDF_GEOPOS;
  }
  
}
 