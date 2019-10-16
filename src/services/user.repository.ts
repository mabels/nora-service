
import { Injectable } from '@andrei-tatar/ts-ioc';
import { Subject } from 'rxjs';
import { PersistService } from './persist-service';
import { User } from './user';
// import { Injectable } from '@andrei-tatar/ts-ioc';

// export interface UserRepository {
//   readonly userBlocked$: Observable<string>;
//   createUserRecordIfNotExists(uid: string): Promise<unknown>;
//   getUser(uid: string): Promise<string>;
//   isUserLinked(uid: string): Promise<boolean>;
//   updateUserLinked(uid: string, linked: boolean): Promise<unknown>;
//   getRefreshToken(uid: string): Promise<number | null>;
//   getNodeRedTokenVersion(uid: string): Promise<number>;
//   incrementNoderedTokenVersion(uid: string): Promise<void>;
// }

@Injectable()
export class UserRepository  {
    private userBlocked = new Subject<string>();

    readonly userBlocked$ = this.userBlocked.asObservable();

    constructor(
        private persist: PersistService,
    ) {
      console.log('UserRepository', persist);
    }

    async createUserRecordIfNotExists(uid: string) {
        try {
            return await this.persist.getUid(uid);
        } catch (e) {
            return await this.persist.setUid(uid);
        }
    }

    async getUser(uid: string) {
        return await this.persist.getUid(uid);
//        const [user] = await this.nodePersist.query<User>(`SELECT * FROM appuser WHERE uid = $1`, uid);
//        if (!user) { throw new Error('user does not exist'); }
    }

    async isUserLinked(uid: string) {
        console.log('NodePersist:isUserLinked', uid);
        throw Error('NodePersist:isUserLinked');
       // const rows = await this.nodePersist.query<User>('select linked from appuser where uid = $1', uid);
       // if (rows && rows.length === 1) { return rows[0].linked; }
        return false;
    }

    async updateUserLinked(uid: string, linked: boolean) {
        console.log('NodePersist:updateUserLinked', uid, linked);
        throw Error('NodePersist:updateUserLinked');
        // await this.nodePersist.query(`UPDATE appuser SET linked = $1 WHERE uid = $2`, linked, uid);
    }

    async getRefreshToken(uid: string): Promise<number | null> {
        console.log('NodePersist:getRefreshToken', uid);
        throw Error('NodePersist:getRefreshToken');
        // const rows = await this.nodePersist.query<User>(`SELECT refreshToken FROM appuser WHERE uid = $1`, uid);
        // if (rows && rows.length === 1) { return rows[0].refreshtoken; }
        return null;
    }

    async getNodeRedTokenVersion(uid: string): Promise<number> {
        const user = await this.getUser(uid);
        console.log('NodePersist:getNodeRedTokenVersion', uid, user);
        return (user || { noderedversion: 1 }).noderedversion;
    }

    async incrementNoderedTokenVersion(uid: string): Promise<User> {
        const user = await this.getUser(uid);
        return user ? this.persist.setUid(uid, {
            ...user,
            noderedversion: user.noderedversion + 1
        }) : this.persist.setUid(uid);
    }
}
