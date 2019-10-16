import { Pool } from 'pg';
import { postgressConnectionString } from '../config';
import { PersistService } from './persist-service';
import { User } from './user';

export class PostgressService implements PersistService {
  readonly HOUR = 3600000;

  private pool = new Pool({
    connectionString: postgressConnectionString,
    ssl: true,
    max: 5,
    idleTimeoutMillis: 4 * this.HOUR,
    connectionTimeoutMillis: 2000,
  });

  async query<T = any>(query: string, ...values: any[]): Promise<T[]> {
    return (this.pool.query(query, values) as unknown) as Promise<T[]>;
  }

  async setUid(
    uid: string,
    user: User = {
      uid,
      refreshtoken: 0,
      noderedversion: 1,
      linked: false,
    }
  ): Promise<User> {
    throw Error('missing setUid Implementation');
    // return (await this.storage()).setItem(`uid.${uid}`, user);
  }

  async getUid(uid: string): Promise<User> {
    throw Error('missing getUid Implementation');
    // return (await this.storage()).getItem(`uid.${uid}`);
    // if (!user) { throw new Error('user does not exist'); }
  }

  async createUserRecordIfNotExists(uid: string) {
    await this.query(
      `INSERT INTO appuser (uid) VALUES ($1) ON CONFLICT DO NOTHING`,
      uid
    );
  }

  async getUser(uid: string) {
    const [user] = await this.query<User>(
      `SELECT * FROM appuser WHERE uid = $1`,
      uid
    );
    if (!user) {
      throw new Error('user does not exist');
    }
    return user;
  }

  async isUserLinked(uid: string) {
    const rows = await this.query<User>(
      'select linked from appuser where uid = $1',
      uid
    );
    if (rows && rows.length === 1) {
      return rows[0].linked;
    }
    return false;
  }

  async updateUserLinked(uid: string, linked: boolean) {
    await this.query(
      `UPDATE appuser SET linked = $1 WHERE uid = $2`,
      linked,
      uid
    );
  }

  async getRefreshToken(uid: string): Promise<number | null> {
    const rows = await this.query<User>(
      `SELECT refreshToken FROM appuser WHERE uid = $1`,
      uid
    );
    if (rows && rows.length === 1) {
      return rows[0].refreshtoken;
    }
    return null;
  }

  async getNodeRedTokenVersion(uid: string): Promise<number> {
    const rows = await this.query<User>(
      `SELECT noderedversion FROM appuser WHERE uid = $1`,
      uid
    );
    if (rows && rows.length === 1) {
      return rows[0].noderedversion;
    }
    return 1;
  }

  async incrementNoderedTokenVersion(uid: string): Promise<void> {
    await this.query(
      `UPDATE appuser SET noderedversion = noderedversion + 1 WHERE uid = $1`,
      uid
    );
  }
}
