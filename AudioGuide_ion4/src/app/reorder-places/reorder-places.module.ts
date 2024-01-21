import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReorderPlacesPage } from './reorder-places.page';

const routes: Routes = [
  {
    path: '',
    component: ReorderPlacesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReorderPlacesPage]
})
export class ReorderPlacesPageModule {}
