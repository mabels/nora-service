import { Container } from '@andrei-tatar/ts-ioc';
import { getClassFactory } from '@andrei-tatar/ts-ioc/inject';
import { storageBackend } from '../config';
import { CloudstoreService } from './cloudstore.service';
import { NodePersistService } from './node-persist.service';
import { PersistService } from './persist-service';
import { PostgressService } from './postgress.service';
import { UserRepository } from './user.repository';


export function factoryUserRepository(
  container: Container
): (..._: any[]) => UserRepository {
  return (..._: any[]) => {
    // let ur: (c: Container) => UserRepository;
    let cfactory: any;
    let sb = storageBackend;
    if (!storageBackend) {
      sb = 'cloudstore';
    }
    switch (sb) {
      case 'cloudstore':
        cfactory = getClassFactory(CloudstoreService);
        break;
      case 'node-persist':
        cfactory = getClassFactory(NodePersistService);
        break;
      case 'postgres':
      default:
        cfactory = getClassFactory(PostgressService);
        break;
    }
    const psrv: PersistService = cfactory(container);
    // console.log('UserRepository', sb, psrv, cfactory);
    return new UserRepository(psrv);
  };
}