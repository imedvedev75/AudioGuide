import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GuideDetailsEditPage } from './guide-details-edit.page';

const routes: Routes = [
  {
    path: '',
    component: GuideDetailsEditPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GuideDetailsEditPage]
})
export class GuideDetailsEditPageModule {}
