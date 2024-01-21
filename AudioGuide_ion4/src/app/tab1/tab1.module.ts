import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { MyTabBarComponent } from '../my-tab-bar/my-tab-bar.component';
import { MyTabBarModule } from '../my-tab-bar/my-tab-bar.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
    MyTabBarModule,
  ],
  declarations: [Tab1Page],
  providers: [
  ],
  exports: [
    Tab1Page
  ],
  entryComponents: []
})
export class Tab1PageModule {}
