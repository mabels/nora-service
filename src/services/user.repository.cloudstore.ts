import { Firestore } from '@google-cloud/firestore';

import { User, UserRepository } from './user.repository';

export class UserRepositoryCloudStore implements UserRepository {
    private readonly firestore = new Firestore();

    private async setUid(uid: string, user: User = {
      uid,
      refreshtoken: 0,
      noderedversion: 1,
      linked: false,
    }): Promise<User> {
      const document = this.firestore.doc(`uid/${uid}`);
      await document.set(user);
      return user;
    }

    private async getUid(uid: string): Promise<User> {
      const document = this.firestore.doc(`uid/${uid}`);
      const got = await document.get();
      if (got.exists) {
        // console.log('GetUid', uid, got.data());
        return got.data() as User;
      } else {
        // console.log('Uid not found', uid);
        throw Error(`Uid:${uid} not found`);
      }
    }

    async createUserRecordIfNotExists(uid: string) {
        return this.setUid(uid) as unknown as any[];
    }

    async getUser(uid: string) {
        return this.getUid(uid);
    }

    async isUserLinked(uid: string) {
        return (await this.getUid(uid)).linked;
    }

    async updateUserLinked(uid: string, linked: boolean) {
        const user = await this.getUid(uid);
        return this.setUid(uid, { ...user, linked }) as unknown as any[];
    }

    async getRefreshToken(uid: string): Promise<number | null> {
        return (await this.getUid(uid)).refreshtoken;
    }

    async getNodeRedTokenVersion(uid: string): Promise<number> {
        return (await this.getUid(uid)).noderedversion;
    }

    async incrementNoderedTokenVersion(uid: string): Promise<void> {
        const user = await this.getUid(uid);
        this.setUid(uid, { ...user, noderedversion: user.noderedversion + 1});
        return;
    }
}
