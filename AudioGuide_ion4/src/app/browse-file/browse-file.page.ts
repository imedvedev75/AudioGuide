import { Component, OnInit } from '@angular/core';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-browse-file',
  templateUrl: './browse-file.page.html',
  styleUrls: ['./browse-file.page.scss'],
})
export class BrowseFilePage implements OnInit {

  private dirs:any;

  constructor(private fileCtrl: File) { 
    this.goToDir();
  }

  ngOnInit() {
  }

  public async goToDir()
  {
    try {
      //this.dirs = await this.fileCtrl.listDir(this.fileCtrl.externalRootDirectory,'');
      this.dirs = await this.fileCtrl.listDir('','');
    }
    catch(err) {
      console.log(err);
    }
  }

}
