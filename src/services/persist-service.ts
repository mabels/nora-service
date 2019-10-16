import { User } from './user';

export interface PersistService {
  setUid(uid: string, user?: User): Promise<User>;
  getUid(uid: string): Promise<User>;
}
