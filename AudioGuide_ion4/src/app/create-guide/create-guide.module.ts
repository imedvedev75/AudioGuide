import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGuidePage } from './create-guide.page';
import { EditPlacePage } from '../edit-place/edit-place.page';
import { EditPlacePageModule } from '../edit-place/edit-place.module';

const routes: Routes = [
  {
    path: '',
    component: CreateGuidePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CreateGuidePage],
  entryComponents: []
})
export class CreateGuidePageModule {}
