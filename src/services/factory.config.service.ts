import { Container } from '@andrei-tatar/ts-ioc';
import { getClassFactory } from '@andrei-tatar/ts-ioc/inject';

import { ConfigEnvService } from './config.env.service';
import { ConfigFireBaseService } from './config.firebase.service';
import { ConfigLocalService } from './config.local.service';
import { ConfigService } from './config.service';

export function factoryConfigService(
  container: Container
): (..._: any[]) => ConfigService {
  return (..._: any[]) => {
    // let ur: (c: Container) => UserRepository;
    let cfactory: any;
    if (typeof process.env.ENTRY_POINT === 'string') {
        cfactory = getClassFactory(ConfigFireBaseService);
    } else {
      try {
        require.resolve('../../config_local');
        cfactory = getClassFactory(ConfigLocalService);
      } catch (e) {
        cfactory = getClassFactory(ConfigEnvService);
      }
    }
    const cfgsrv: ConfigService = cfactory(container);
    // console.log('UserRepository', sb, psrv, cfactory);
    return cfgsrv;
  };
}
