import { Container } from '@andrei-tatar/ts-ioc';
import { getClassFactory } from '@andrei-tatar/ts-ioc/inject';

import { Observable } from 'rxjs';
import { storageBackend } from '../config';
import { CloudstoreUserRepository } from './cloudstore.user.repository';
import { NodePersistUserRepository } from './node-persist.user.repository';
import { PostgressUserRepository } from './postgress.user.repository';
// import { retry } from 'rxjs/operators';

export interface UserRepository {
  readonly userBlocked$: Observable<string>;
  createUserRecordIfNotExists(uid: string): Promise<unknown>;
  getUser(uid: string): Promise<string>;
  isUserLinked(uid: string): Promise<boolean>;
  updateUserLinked(uid: string, linked: boolean): Promise<unknown>;
  getRefreshToken(uid: string): Promise<number | null>;
  getNodeRedTokenVersion(uid: string): Promise<number>;
  incrementNoderedTokenVersion(uid: string): Promise<void>;
}

export function factoryUserRepository(
  container: Container
): (..._: any[]) => UserRepository {
  return (..._: any[]) => {
    let ur: (c: Container) => UserRepository;
    switch (storageBackend) {
      case 'cloudstore':
        ur = getClassFactory(CloudstoreUserRepository);
        break;
      case 'node-persist':
        ur = getClassFactory(NodePersistUserRepository);
        break;
      default:
        ur = getClassFactory(PostgressUserRepository);
        break;
    }
    return ur(container);
  };
}

export interface User {
  readonly uid: string;
  refreshtoken: number;
  noderedversion: number;
  linked: boolean;
}
