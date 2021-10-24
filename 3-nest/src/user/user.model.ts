import { CRUDReturn } from './crud_return.interface';
import { Helper } from './helper';
import * as admin from 'firebase-admin';

export class User {
  private id: string;
  private name: string;
  private age: number;
  private email: string;
  private password: string;

  constructor(name: string, age: number, email: string, password: string, id?: string) {
    
    this.name = name;
    this.age = age;
    this.email = email;
    this.password = password;

    if(id == undefined || id == null) {
    this.id = Helper.generateUID();
    }
    else{
    this.id = id;
    }
  }


  async retrieve(id: string): Promise<User>{
      try {
          var DB = admin.firestore();
          var res = await DB.collection("users").doc(id).get();
          if(res.exists){
              var data = res.data();
              return new User(
              data["name"],
              data["age"],
              data["email"],
              data["password"],
              res.id
              );

          }
      }catch(error){
          console.log(error);
          return null;

      }
  }

  crudPusher(): CRUDReturn {
    if (Helper.validBody(this.toJson())) {
      console.log('Pushing: ' + this.toJson());
      return { success: true, data: this.toJson() };
    } else {
      return { success: false, data: 'Body not valid!' };
    }
  }

  overrideUUID(oldID: string) {
    console.log('Changing ID: ' + this.id + ' to: ' + oldID);
    this.id = oldID;
  }

  login(password: string): CRUDReturn {
    try {
      if (this.password === password) {
        return { success: true, data: this.toJson() };
      } else {
        throw new Error(`${this.email} login fail, password does not match`);
      }
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  userPrompt() {
    return `${this.id}:${this.name}:${this.email}`;
  }

  checkAtt(value: string) {
    if (value == this.id) {
      return true;
    }

    if (parseInt(value) == this.age) {
      return true;
    }

    if (value == this.name) {
      return true;
    }

    if (value == this.email) {
      return true;
    } else {
      return false;
    }
  }

  setAtt(value: string, att: string) {
    if (att == 'id') {
      this.id = value;
    }
    if (att == 'name') {
      this.name = value;
    }

    if (att == 'email') {
      this.email = value;
    }

    if (att == 'password') {
      this.password = value;
    }

    if (att == 'age') {
      var parsedAge = parseInt(value);
      this.age = parsedAge;
    }
    console.log('Att: ' + att + '\nValue: ' + value);
  }
  toJson() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      email: this.email,
    };
  }

  toJsonSecure() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      email: this.email,
      password: this.password,
    };
  }

  passwordPusher() {

    return {
      password: this.password,
    };
  }
}


