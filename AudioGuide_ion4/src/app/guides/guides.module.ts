import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GuidesPage } from './guides.page';
import { MyTabBarModule } from '../my-tab-bar/my-tab-bar.module';

const routes: Routes = [
  {
    path: '',
    component: GuidesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MyTabBarModule
  ],
  declarations: [GuidesPage]
})
export class GuidesPageModule {}
