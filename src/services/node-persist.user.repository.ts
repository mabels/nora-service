import { Injectable } from '@andrei-tatar/ts-ioc';
import { Subject } from 'rxjs';
import { NodePersistService } from './node-persist.service';
import { User } from './user.repository';
// import { User } from './user.repository';

@Injectable()
export class NodePersistUserRepository {
    private userBlocked = new Subject<string>();

    readonly userBlocked$ = this.userBlocked.asObservable();

    constructor(
        private nodePersist: NodePersistService,
    ) {
    }

    async createUserRecordIfNotExists(uid: string) {
        try {
            return await this.nodePersist.getUid(uid);
        } catch (e) {
            return await this.nodePersist.setUid(uid);
        }
    }

    async getUser(uid: string) {
        return await this.nodePersist.getUid(uid);
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
        return user ? this.nodePersist.setUid(uid, {
            ...user,
            noderedversion: user.noderedversion + 1
        }) : this.nodePersist.setUid(uid);
    }
}

// (async function () {
//     const service = new PostgressService();
//     // await service.query(`
//     //     CREATE TABLE IF NOT EXISTS appuser (
//     //         uid VARCHAR(30) CONSTRAINT pk PRIMARY KEY,
//     //         linked boolean DEFAULT false
//     //     )`
//     // );

//     // await service.query('ALTER TABLE appuser ADD COLUMN noderedversion integer DEFAULT 1');
//     const repo = new UserRepository(service);
//     // await repo.incrementNoderedTokenVersion('ARcEql2ileYghxMOstan2bOsSEj1');
//     // const users = await service.query('select * from appuser');

//     console.log(await repo.getUser('ARcEql2ileYghxMOstan2bOsSEj1'));

// })().catch(err => {
//     console.error(err);
// }).then(() => {
//     console.log('done');
// });

// export interface User {
//     readonly uid: string;
//     refreshtoken: number;
//     noderedversion: number;
//     linked: boolean;
// }
