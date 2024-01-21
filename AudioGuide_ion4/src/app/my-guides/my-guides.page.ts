import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GlobService } from '../glob.service';
import { Constants, GUIDE_DETAILS_EMPTY } from '../constants.service';
import { Storage } from '@ionic/storage';
import { DBStorageService } from '../dbstorage.service';

@Component({
  selector: 'app-my-guides',
  templateUrl: './my-guides.page.html',
  styleUrls: ['./my-guides.page.scss'],
})
export class MyGuidesPage implements OnInit {

  guides = [];

  constructor(private navCtrl: NavController,
    private storage: Storage,
    private glob: GlobService,
    private db: DBStorageService,
    ) { }

  async ngOnInit() {
    let my_server_guides = <[]>(await this.glob.post('/get_my_guides', {}));
    my_server_guides.forEach(function(g) {
      this.guides.push({
        guide_uuid: g.guide_uuid,
        guide_name: g.guide_name,
        mode: 1
      })
    }.bind(this));
    if (this.glob.isMobile())
      this.guides = this.guides.concat(this.db.myGuides);
  }

  click(guide) {
    this.navCtrl.navigateForward(['/guide-details-edit', guide.guide_uuid, guide.mode]);
  }

  async addGuide() {
    let guide_name = await this.glob.inputValue("Enter Guide Name", "Guide Name");

    if (!guide_name)
      return;

    let new_guide_entry = {
      guide_uuid: GlobService.generate_UUID(),
      guide_name: guide_name,
      mode: this.glob.isMobile() ? '2' : '1'  //todo: add mode select menu
    }
    let new_guide = GUIDE_DETAILS_EMPTY;
    new_guide.guide_name = new_guide_entry.guide_name;
    new_guide.guide_uuid = new_guide_entry.guide_uuid;
    new_guide.mode = new_guide_entry.mode;
    if (!new_guide.mode) {
      this.db.addMyGuide(new_guide_entry);
    }
    this.db.saveOrUploadMyGuide(new_guide);
    this.navCtrl.navigateForward(['/guide-details-edit', new_guide.guide_uuid, new_guide.mode]);
  }

  async delete(guide) {
    if ('cancel' == await this.glob.confirm('Delete Guide', 'Do you really want to delete guide?'))
      return;

    if ('1' == guide.mode) {
      this.glob.post('/delete_guide', {guide_uuid:guide.guide_uuid})
    }
    else {
      this.db.deleteMyGuide(guide);
    }
  }
}
