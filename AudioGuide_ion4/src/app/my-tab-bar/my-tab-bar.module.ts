import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyTabBarComponent } from '../my-tab-bar/my-tab-bar.component';
import { MyTabButtonModule } from '../my-tab-button/my-tab-button.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MyTabButtonModule
  ],
  declarations: [MyTabBarComponent],
  providers: [
  ],
  exports: [
    MyTabBarComponent
  ],
  entryComponents: []
})
export class MyTabBarModule {}
