import { Firestore } from '@google-cloud/firestore';
import { FirebaseService } from './firebase.service';
import { PersistService } from './persist-service';
import { User } from './user';

// import { Pool } from 'pg';
// import { postgressConnectionString } from '../config';

export class CloudstoreService implements PersistService {

  private readonly firestore = new Firestore();

  constructor(
    private fireBase: FirebaseService
  ) {
    if (this.fireBase) {
      // make the compile happy
    }
  }


  async setUid(uid: string, user: User = {
    uid,
    refreshtoken: 0,
    noderedversion: 1,
    linked: false,
  }): Promise<User> {
    const document = this.firestore.doc(`uid/${uid}`);
    await document.set(user);
    return user;
  }

  async getUid(uid: string): Promise<User> {
    const document = this.firestore.doc(`uid/${uid}`);
    const got = await document.get();
    if (got.exists) {
      console.log('GetUid', got.data());
      return got.data() as User;
    } else {
      console.log('Uid not found', uid);
      throw Error(`Uid:${uid} not found`);
    }
  }

}
