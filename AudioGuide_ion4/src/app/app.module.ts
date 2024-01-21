import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, NavParams } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AddTrackPage } from './add-track/add-track.page';
import { AddTrackPageModule } from './add-track/add-track.module';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { EditPlacePageModule } from './edit-place/edit-place.module';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera } from '@ionic-native/camera/ngx'
import { InputValuePage } from './input-value/input-value.page';
import { InputValuePageModule } from './input-value/input-value.module';
import { PlacePage } from './place/place.page';
import { PlacePageModule } from './place/place.module';
import { ReorderPlacesPage } from './reorder-places/reorder-places.page';
import { ReorderPlacesPageModule } from './reorder-places/reorder-places.module';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { BrowseFilePageModule } from './browse-file/browse-file.module';
import { BrowseFilePage } from './browse-file/browse-file.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { LoginPageModule } from './login/login.module';
import { RegisterPageModule } from './register/register.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [AddTrackPage, InputValuePage, PlacePage, ReorderPlacesPage, BrowseFilePage, LoginPage, RegisterPage], 
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    AddTrackPageModule,
    EditPlacePageModule, 
    InputValuePageModule,
    PlacePageModule,
    ReorderPlacesPageModule,
    BrowseFilePageModule,
    LoginPageModule,
    RegisterPageModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Geolocation,
    SQLite,
    BackgroundMode,
    BackgroundGeolocation,
    NativeAudio,
    MediaCapture,
    FileOpener,
    File,
    NativeAudio,
    Media,
    WebView,
    Camera,
    FileTransfer
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
