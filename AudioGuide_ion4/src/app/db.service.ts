import { Injectable } from '@angular/core';
import { SQLite, SQLiteDatabaseConfig } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { GlobService } from './glob.service';

declare var SQL;

@Injectable({
  providedIn: 'root'
})
export class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {

    var db = new SQL.Database();
    return new Promise((resolve,reject)=>{
    resolve(new SQLiteObject(db));
    });
  }
} 

class SQLiteObject{
  _objectInstance: any;

  constructor(_objectInstance: any){
      this._objectInstance = _objectInstance;
  };

  executeSql(statement: string, params: any): Promise<any>{

      return new Promise((resolve,reject)=>{
          try {
              var st = this._objectInstance.prepare(statement,params);
              var rows :Array<any> = [] ;
              while(st.step()) { 
                  var row = st.getAsObject();
                  rows.push(row)
              }
              var payload = {
                  rows: {
                  item: function(i) {
                      return rows[i];
                  },
                  length: rows.length
                  },
                  rowsAffected: this._objectInstance.getRowsModified() || 0,
                  insertId: this._objectInstance.insertId || void 0
              };  
              resolve(payload);
          } catch(e){
              reject(e);
          }
      });
  };

}


@Injectable({
  providedIn: 'root'
})
export class DBService {

  private db: any;
  private promise: Promise<any>;

  constructor(private sqliteMock: SQLiteMock,
              private sqlite: SQLite,
              private platform: Platform,
              private glob: GlobService) {
    console.log("Instance of DB provider created"); 
    this.init();
  }

  async ready() {
    return this.promise;
  }

  async init() {
    this.promise = new Promise(async function(resolve, reject) {
      await this.platform.ready();
      if (!this.platform.is("mobile")) {
        this.db = await this.sqliteMock.create({name: 'data.db',  location: 'default'});
        await this.createTables();
        resolve();
      }
      else {
        try {
          this.db = await this.sqlite.create({name: 'data.db',  location: 'default'});
          this.createTables();
          resolve();
        }
        catch(e) {
          this.glob.showToast(e);
          reject();
        };
      }
    }.bind(this));
  }

  async createTables() {
    try {
      await this.db.executeSql('create table tracks(track_uuid VARCHAR(60), track_name VARCHAR(60))', {});
      await this.db.executeSql('create table data(track_uuid VARCHAR(60), lat DOUBLE, lng DOUBLE)', {});
    } catch(e) {
      this.glob.showToast(e);
    }
  }


  async getMyWishes() {
    var mywishes = [];
    var data = await this.db.executeSql("SELECT * FROM mywishes", {});
    for (var i = 0; i < data.rows.length; i++) {
      mywishes.push(data.rows.item(i));
    }    
    return mywishes;
  }

  addMyWish(wish) {
    var stmt = `INSERT INTO mywishes (wish_uuid, wish_admin_uuid) VALUES ("${wish.wish_uuid}", "${wish.admin_uuid}")`;
    this.db.executeSql(stmt, {});
  }

  async getMyChats() {
    var chats = [];
    var data = await this.db.executeSql(`SELECT * FROM mychats`, {});
    for (var i = 0; i < data.rows.length; i++) {
      chats.push(data.rows.item(i));
    }    
    return chats;    
  }

  async getChatByWishUuid (wish_uuid) {
    var data = await this.db.executeSql(`SELECT * FROM mychats WHERE wish_uuid="${wish_uuid}"`, {});
    return (data.rows.length > 0) ? (data.rows.item(0)) : null;
  }

  async getChatByChatUuid(chat_uuid) {
    var data = await this.db.executeSql(`SELECT * FROM mychats WHERE chat_uuid="${chat_uuid}"`, {});
    return (data.rows.length > 0) ? (data.rows.item(0)) : null;
  }

  async addServerChats(chats) {
    chats.forEach(function (chat) {
      this.db.executeSql(`INSERT INTO mychats (wish_uuid, chat_uuid, inbox_uuid, outbox_uuid, counterpart_nick,\
        starter_nick, text) VALUES ("${chat.wish_uuid}", "${chat.chat_uuid}", "${chat.outbox_uuid}", "${chat.inbox_uuid}", \
        "${chat.starter_nick}",  "${chat.counterpart_nick}",  "${chat.text}")`, {});
      }.bind(this));
  }

  async addMyChat(chat) {
    this.db.executeSql(`INSERT INTO mychats (wish_uuid, chat_uuid, inbox_uuid, outbox_uuid, counterpart_nick,\
      starter_nick, text) VALUES ("${chat.wish_uuid}", "${chat.chat_uuid}", "${chat.inbox_uuid}", "${chat.outbox_uuid}", \
      "${chat.counterpart_nick}",  "${chat.starter_nick}",  "${chat.text}")`, {});    
  }

  public deleteChat(uuid) {
    this.db.executeSql(`DELETE FROM mychats WHERE chat_uuid="${uuid}"`, {});
  }  

  async get_chat_messages(chat_uuid) {
    var mess = [];
    var data = await this.db.executeSql(`SELECT * FROM mymessages WHERE chat_uuid="${chat_uuid}"`, {});
    for (var i = 0; i < data.rows.length; i++) {
      mess.push(data.rows.item(i));
    }    
    return mess;     
  }

  add_server_messages(chat_uuid, messages) {
    messages.forEach(function (m) {
      m["my"] = 0;
      this.db.executeSql(`INSERT INTO mymessages (chat_uuid, text, my, unread) VALUES ("${chat_uuid}", "${m.text}",\
        ${m.my}, 1)`, {});
    }.bind(this))
  }

  add_my_message(chat_uuid, m) {
    m["my"] = 1;
    this.db.executeSql(`INSERT INTO mymessages (chat_uuid, text, my, unread) VALUES ("${chat_uuid}", "${m.text}",\
      ${m.my}, 0)`, {});
  }

  async get_unread_messages_count_total() {
    var data = await this.db.executeSql(`SELECT COUNT(*) as count FROM mymessages WHERE unread=1`, {});
    return data.rows.item(0).count;
  }

  async get_unread_messages_count_chat(chat_uuid) {
    var data = await this.db.executeSql(`SELECT COUNT(*) as count FROM mymessages WHERE (chat_uuid="${chat_uuid}") AND (unread=1)`, {});
  }  

  read_messages(chat_uuid) {
    this.db.executeSql(`UPDATE mymessages SET unread=0 WHERE chat_uuid="${chat_uuid}"`, {});
  }

}
