// import { Pool } from 'pg';
// import { postgressConnectionString } from '../config';
import * as Storage from 'node-persist';
import { User } from './user.repository';

export class NodePersistService {

  private initDone = false;
  private async storage() {
    if (!this.initDone) {
      await Storage.init( /* options ... */ );
      this.initDone = true;
    }
    return Storage;
  }

  async setUid(uid: string, user: User = {
    uid,
    refreshtoken: 0,
    noderedversion: 1,
    linked: false,
  }): Promise<User> {
    return (await this.storage()).setItem(`uid.${uid}`, user);
  }

  async getUid(uid: string): Promise<User> {
    return (await this.storage()).getItem(`uid.${uid}`);
    // if (!user) { throw new Error('user does not exist'); }
  }

  // async query<T = any>(query: string, ...values: any[]): Promise<T[]> {
  //   await this.testInit();
  //   storage.
  //     console.log('NodePersist:', query, values);
  //     // const result = await this.pool.query(query, values);
  //     return []; // result.rows;
  // }
}
