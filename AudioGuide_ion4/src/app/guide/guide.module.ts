import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuidePage } from './guide.page';
import { MyTabBarModule } from '../my-tab-bar/my-tab-bar.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: GuidePage }]),
    MyTabBarModule
  ],
  declarations: [GuidePage],
  exports: [
    GuidePage
  ],
})
export class GuidePageModule {}
