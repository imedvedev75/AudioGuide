import { Component } from '@angular/core';

import { Platform, Events, ModalController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Environment } from '@ionic-native/google-maps/ngx';
import { DBService } from './db.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Constants } from './constants.service';
import { LoginPage } from './login/login.page';
import { GlobService } from './glob.service';
import { NavComponent } from '@ionic/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/guides/1',
      icon: 'headset'
    },
    {
      title: 'My Guides',
      url: '/my-guides',
      icon: 'create'
    },
    {
      title: 'Downloaded Guides',
      url: '/guides/2',
      icon: 'download'
    },
    {
      title: 'London Buses',
      url: '/buses',
      icon: 'bus'
    },    
    {
      title: 'Logout',
      icon: 'log-out'
    }
  ];

  constructor(
    private platform: Platform, 
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private backgroundMode: BackgroundMode,
    public events: Events,
    private modalCtrl: ModalController,
    private glob: GlobService,
    private navCtrl: NavController
    /*private db: DBService*/
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Environment.setBackgroundColor(Constants.COL_BK_MAIN);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.events.subscribe('need-to-login',() => {
        this.login();
      });      
      //this.db.init();
      this.backgroundMode.enable();
      if (this.platform.is("desktop"))  {
        //document.body.style.setProperty('--color-bk-main', Constants.COL_BK_MAIN);
        //document.body.style.setProperty('--color-main', Constants.COL_MAIN);
      }
    });
  }

  async login() {
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();   
   }

   menuClick(p) {
      if ('Logout' == p.title) {
        this.glob.post('/logout', {});
        return;
      }

      this.navCtrl.navigateRoot(p.url);
   }
}
