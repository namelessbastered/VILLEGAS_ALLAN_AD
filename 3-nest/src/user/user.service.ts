import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Helper } from './Helper';
import { CRUDReturn } from './crud_return.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class UserService {
  private DB = admin.firestore();

  seqNum = 0;
  users: Map<string, User> = new Map<string, User>();

  constructor() {
    this.users = Helper.populate();

    for(const leanne of this.users.values()){
        if(leanne.toJson().name === "Leanne Graham"){
            this.commit(leanne,"none",leanne.toJson().id);
        }

    }

    for(const ervin of this.users.values()){
        if(ervin.toJson().name === "Ervin Howell"){
            this.commit(ervin,"none",ervin.toJson().id);
        }
    }

    for(const nathan of this.users.values()){
        if(nathan.toJson().name === "Nathan Plains"){
            this.commit(nathan,"none",nathan.toJson().id);
        }
    }

    for(const patricia of this.users.values()){
        if(patricia.toJson().name === "Patricia Lebsack"){
            this.commit(patricia,"none",patricia.toJson().id);
        }
    }
    this.printAllUsers();
  }

  async addUser(body: any): Promise<CRUDReturn> {
    try {
      var bodyOK: boolean = Helper.validBody(body).valid;
      if (bodyOK) {
        if ((await this.emailExists(body.email)) === false) {
          if (this.validateBody(body) == true) {
            var usrHldr: User = new User(
              body.name,
              body.age,
              body.email,
              body.password,
              body?.id,
            );
          }
        }
        if (await this.commit(usrHldr, 'none', usrHldr.toJsonSecure().id)) {
          return {
            success: true,
            data: usrHldr.toJson(),
          };
        }
      } else {
        return {
          success: false,
          data: body.email + ' is already in use by another user!',
        };
      }
    } catch (e) {
      return { success: false, data: `Error adding account` };
    }
  }

  async commit(usr: User, option?: string, id?: string): Promise<CRUDReturn> {
    try {
      if (option === 'patchMode') {
      }
      var DB = admin.firestore();
      var emEx = this.emailExists(usr.toJson().email);
      if ((await emEx) === false) {
        var res = await DB.collection('user').doc(id).set(usr.toJsonSecure());
        console.log(
          'Email [' + usr.toJson().email + '] is not in database. Searching...',
        );
        return { success: true, data: usr.toJson() };
      } else {
        console.log(
          'Email [' + usr.toJson().email + '] exists.',
        );
      }
    } catch (error) {
      console.log(error);
      return { success: false, data: error.message };
    }
  }

  async getAllUserObj(): Promise<Array<User>> {
    var res: Array<User> = [];
    try {
      var dbDat: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> =
        await this.DB.collection('user').get();

      dbDat.forEach((doc) => {
        if (doc.exists) {
          var data = doc.data();
          res.push(
            new User(
              data['name'],
              data['age'],
              data['email'],
              data['password'],
              data['id'],
            ),
          );
        }
      });
      return res;
    } catch (e) {
      return null;
    }
  }

  async printAllUsers(): Promise<CRUDReturn> {
    var res: Array<any> = [];
    try {
      var allUsr = await this.getAllUserObj();
      allUsr.forEach((user) => {
        res.push(user.toJsonSecure());
      });
      return { success: true, data: res };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  async userQuery(query: string): Promise<CRUDReturn> {
    try {
      var resulta = await this.DB.collection('user').doc(query).get();
      if (resulta.exists) {
        return {
          success: true,
          data: resulta.data(),
        };
      } else {
        return {
          success: false,
          data: `User ${query} does not exist in the database`,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: error,
      };
    }
  }

  async checkExists(body: any): Promise<CRUDReturn> {
    try {
      var dbIter = await this.DB.collection('user').get();

      for (const dbIterVar of dbIter.docs) {
        if (body.id === dbIterVar.id) {
          return { success: true, data: dbIterVar.data() };
        }
      }

      return { success: false, data: 'not in database' };
    } catch (e) {
      return { success: false, data: 'Fail' };
    }
  }

  async editUserData(user: any, id: string): Promise<CRUDReturn> {
    try {
      var validPutBody = await Helper.validBodyPut(user).valid;

      if ((await this.userQuery(id)).success == true) {
        if (validPutBody == true) {
          if ((await this.emailExists(user?.email)) == false) {
            var db = this.DB.collection('user').doc(id);
            var usr: User = new User(
              user.name,
              user.age,
              user.email,
              user.password,
              id,
            );
            db.update(usr.toJsonSecure());
            console.log(usr.toJson());
            return { success: true, data: usr.toJson() };
          } else {
            return { success: false, data: 'Email is in database' };
          }
        } else {
          return { success: false, data: Helper.validBodyPut(user).data };
        }
      } else {
        return { success: false, data: `User ${id} is not in database` };
      }
    } catch (e) {
      return { success: false, data: 'Error' };
    }
  }

  async deleteAccount(id: string): Promise<CRUDReturn> {
    try {
      var delDbSearcher = await this.DB.collection('user').get();
      for (const delDoc of delDbSearcher.docs) {
        if (delDoc.id === id) {
          const deletedDocCpy = delDoc.data();
          this.DB.collection('user').doc(delDoc.id).delete();
          return { success: true, data: deletedDocCpy };
        }
      }
      return { success: false, data: `User ${id} is not in database` };
    } catch (err) {
      return { success: false, data: `${err.message}` };
    }
  }

  async authFunction(body: any) {
    try {
      var dbDocIter = await this.DB.collection('user').get();

      for (const authDocs of dbDocIter.docs) {
        if (
          authDocs.data()['email'] == body.email &&
          authDocs.data()['password'] != body.password
        ) {
          return { success: false, data: 'Invalid password' };
        }

        if (
          authDocs.data()['password'] == body.password &&
          authDocs.data()['email'] == body.email
        ) {
          return { success: true, data: authDocs.data() };
        }
      }
      return { success: false, data: `User ${body.email} is not in database` };
    } catch (err) {}

    return { success: false, data: 'Login error' };
  }

  async patchFunc(id: string, userBody: any): Promise<CRUDReturn> {
    try {
      var changeArray = '';

      if (
        userBody?.password != undefined &&
        typeof userBody?.password != 'string'
      ) {
        return { success: false, data: 'Invalid Password' };
      }
      if (userBody?.name != undefined && typeof userBody?.name != 'string') {
        return { success: false, data: 'Invalid Name' };
      }
      if (userBody?.email != undefined && typeof userBody?.email != 'string') {
        return { success: false, data: 'Invalid Email' };
      }
      if (userBody?.age != undefined && typeof userBody?.age != 'number') {
        return { success: false, data: 'Invalid Age' };
      }
      if (userBody?.email != undefined) {
        if ((await this.emailExists(userBody?.email)) == true) {
          return { success: false, data: 'Email Exists' };
        }
      }

      var db = this.DB.collection('user').doc(id);
      if ((await db.get()).exists == true) {
        if (
          userBody?.name != undefined &&
          userBody?.name != null &&
          typeof userBody?.name == 'string'
        ) {
          console.log('Name has set to ' + userBody?.name);
          changeArray += '\nName been changed to' + userBody?.name;
          await db.update({ name: userBody?.name });
        }
        if (
          userBody?.email != undefined &&
          userBody?.email != null &&
          typeof userBody?.email == 'string'
        ) {
          console.log('Email is set to ' + userBody?.email);
          changeArray += 'Email is set to ' + userBody?.email;
          await db.update({ email: userBody?.email });
        }
        if (userBody?.age != undefined && typeof userBody?.age == 'number') {
          console.log('Age has set to ' + userBody?.age);
          changeArray += 'Age is been set to ' + userBody?.age;
          await db.update({ age: userBody?.age });
        }
        if (
          userBody?.password != undefined &&
          userBody?.password != null &&
          typeof userBody?.password == 'string'
        ) {
          console.log('Password has set to ' + userBody?.password);
          changeArray += 'Password changed.';
          await db.update({ password: userBody?.password });
        }

        if (changeArray != null || changeArray != '') {
          return {
            success: true,
            data: (await this.DB.collection('user').doc(id).get()).data(),
          };
        } else {
          return { success: false, data: 'No patch .... fail' };
        }
      } else {
        return { success: false, data: `User ${id} is not in database` };
      }
    } catch (e) {
      return { success: false, data: e };
    }
  }

  async broadSearch(searchString: string): Promise<CRUDReturn> {
    try {
      var dbDatQuery = await this.DB.collection('user').get();
      var resArr = [];
      resArr = [];
      dbDatQuery.forEach(doc=>{
        if (doc.data()['email'] == searchString) {
          console.log('Email is searchString');
          resArr.push(doc.data());
        }
        if (doc.data()['name'] == searchString) {
          console.log('Name is searchString');
          resArr.push(doc.data());
        }
        if (doc.data()['id'] == searchString) {
          console.log('Id is searchString');
          resArr.push(doc.data());
        }
        if (doc.data()['age'] == searchString) {
          console.log('Age is searchString');
          resArr.push(doc.data());
        }
        if (resArr.length > 0) {
            console.log(resArr);
            return {success: true, data: resArr};
        }
       
      }
      )
      if (resArr.length > 0) {
        console.log(resArr);
        return {success: true, data: resArr};
    }
    else{
        return {success: false, data:"Error"};
    }

      
    } catch (e) {
      return { success: false, data: 'Error' };
    }
  }

  validateBody(body: any) {
    var stringBuilder;

    if (
      typeof body?.age == 'number' &&
      typeof body?.name == 'string' &&
      typeof body?.email == 'string' &&
      typeof body?.password == 'string'
    ) {
      console.log('WAW! NICE! POWER!');
      if (
        body?.name != 'undefined' &&
        body?.age != 'undefined' &&
        body?.email != 'undefined' &&
        body?.password != 'undefined'
      ) {
        console.log('Success!');
        for (const iter1 of this.users.values()) {
          if (iter1.toJson().email === body?.email) {
            return { success: false, data: `User ${body.email} is in database` };
          }
        }
        return true;
      }
    } else {

      if (typeof body?.name == 'undefined') {
        return { success: false, data: `${body.name} is not in database` };
      }

      if (typeof body?.age == 'undefined') {
        return { success: false, data: `${body.age} is not in database` };
      }

      if (typeof body?.email == 'undefined') {
        return { success: false, data: `${body.email} is not in database` };
      }

      if (typeof body?.password == 'undefined') {
        return { success: false, data: `${body.password} is not in database` };
      }
      

      if (typeof body?.name != 'string') {
        stringBuilder += ' - input name is not in databse';
        return { success: false, data: `${body.name} is not in database` };
      }

      if (typeof body?.age != 'number') {
        stringBuilder += ' - input Age is not in database';
        return { success: false, data: `${body.age} is not in database` };
      }

      if (typeof body?.email != 'string') {
        stringBuilder += ' - input Email is not in database';
        return { success: false, data: `${body.email} is not in database` };
      }

      if (typeof body?.password != 'string') {
        stringBuilder += ' - input Password is not in database';
        return { success: false, data: `${body.password} is not in database` };
      }

      console.log(stringBuilder);
      return { success: false, data: 'invalid input!' };
    }
  }

  async emailExists(
    email: string,
    options?: { exceptionId: string },
  ): Promise<boolean> {
    try {
      var DB = admin.firestore();
      var usrRes = await DB.collection('user')
        .where('email', '==', email)
        .get();
      console.log('Database empty?');
      console.log(usrRes.empty);
      if (usrRes.empty) return false;
      for (const doc of usrRes.docs) {
        console.log(doc.data());
        console.log('Used by another user?');
        console.log(options != undefined);
        if (options != undefined) {
          if (doc.id == options?.exceptionId) continue;
        }
        if (doc.data()['email'] === email) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch (error) {
      console.log('Email exists');
      console.log(error.message);
      return false;
    }
  }
}


