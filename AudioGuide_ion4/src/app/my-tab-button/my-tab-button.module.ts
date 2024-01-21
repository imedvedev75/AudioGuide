import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyTabButtonComponent } from '../my-tab-button/my-tab-button.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [MyTabButtonComponent],
  providers: [
  ],
  exports: [
    MyTabButtonComponent
  ],
  entryComponents: []
})
export class MyTabButtonModule {}
