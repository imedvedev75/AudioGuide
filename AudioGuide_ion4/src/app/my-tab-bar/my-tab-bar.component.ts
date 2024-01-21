import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MyTabButtonComponent } from '../my-tab-button/my-tab-button.component';
import { NavController } from '@ionic/angular';
import { GlobService } from '../glob.service';

@Component({
  selector: 'my-tab-bar',
  templateUrl: './my-tab-bar.component.html',
  styleUrls: ['./my-tab-bar.component.scss'],
})
export class MyTabBarComponent implements OnInit {

  //@ViewChild('queueNameField') public queueNameField: any;
  public currTab: number = 0;
  @ViewChildren(MyTabButtonComponent) _btns: QueryList<MyTabButtonComponent>;
  btns: Array<MyTabButtonComponent>;
  currBtn: MyTabButtonComponent;

  constructor(private navCtrl: NavController,
    private glob: GlobService) { 
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.btns = this._btns.toArray();
      this.btns[this.glob.currTab].selected=true;
      this.currBtn = this.btns[this.glob.currTab];
      for (var i = 0; i < this.btns.length; i++) {
        this.btns[i].click = this.makeClick(i);
      }
    })
  }

  makeClick(i) {
    return function() {
      if (this.glob.currTab == i)
        return;
      this.glob.currTab = i;
      if (this.currBtn) {
        this.currBtn.selected = false;
      }
      this.currBtn = this.btns[i];
      this.currBtn.selected = true;
      this.doClick(i);
    }.bind(this)
  }

  doClick(i) {
    if (0 == i) {
      this.navCtrl.navigateRoot('/track');
    }
    else if (1 == i) {
      this.navCtrl.navigateRoot('/tracks');
    }
    else if (2 == i) {
      this.navCtrl.navigateRoot('/guides');
    }
  }
  
}
