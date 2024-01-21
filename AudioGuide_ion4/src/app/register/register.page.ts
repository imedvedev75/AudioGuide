import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Constants } from '../constants.service';
import { SERVER_URL } from 'src/environments/environment';

const KEY_EMAIL = "EMAIL";
const KEY_PASSWORD = "PASSWORD";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  @ViewChild('emailField') emailField: any;
  @ViewChild('nameField') nameField: any;
  @ViewChild('passwordField') passwordField: any;
  @ViewChild('confirmPasswordField') confirmPasswordField: any;
  public emailText: string;
  public nameText: string;
  public passwordText: string;
  public confirmPasswordText: string;
  public footer: string;

  constructor(private modalCtrl: ModalController,
    private storage: Storage,
    private aHttpClient: HttpClient) {
  }

  ngOnInit() {}

  ionViewDidEnter(): void {
    setTimeout(async function()  {
      this.emailText = await this.storage.get(KEY_EMAIL);
      this.nameText = await this.storage.get('NAME');
      this.passwordText = await this.storage.get(KEY_PASSWORD);
      if (!this.emailText) {
        this.emailField.setFocus();
      }
      else if (!this.nameText)
        this.nameField.setFocus();      
      else if (!this.passwordText)
        this.passwordField.setFocus();
      else
        this.confirmPasswordField.setFocus();
    }.bind(this), 200);
  }

  async register() {
    if (this.passwordText != this.confirmPasswordText) {
      this.footer = "Passwords do not match!";
      return;
    }

    let input = {
      email: this.emailText,
      name: this.nameText,
      password: this.passwordText
    };

    this.storage.set(KEY_EMAIL, this.emailText);
    this.storage.set('NAME', this.nameText);

    try {
      var resp = await this.aHttpClient.post(SERVER_URL + "/new_user", input, 
        {withCredentials: true, observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}).toPromise();
      this.modalCtrl.dismiss(resp);
    }
    catch(error) {
      if (error.status == 400) { //user exists
        this.footer = "User already exists";
      }
      else {
        this.footer = "Error registering new user";
      }
    };
  }

  close() {
    this.modalCtrl.dismiss(null);
  }  
}
