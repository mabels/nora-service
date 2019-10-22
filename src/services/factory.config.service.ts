import { Container } from '@andrei-tatar/ts-ioc';

import { ConfigEnvService } from './config.env.service';
import { ConfigFireBaseService } from './config.firebase.service';
import { ConfigLocalService } from './config.local.service';
import { ConfigService } from './config.service';

export function factoryConfigService(
  container: Container
): (..._: any[]) => ConfigService {
  return (..._: any[]) => {
    // let ur: (c: Container) => UserRepository;
    // console.log('factoryConfigService:', process.env);
    let csrv: ConfigService;
    if (typeof process.env.ENTRY_POINT === 'string' ||
        typeof process.env.FUNCTION_TARGET === 'string') {
        csrv = container.resolve(ConfigFireBaseService);
    } else {
      try {
        require.resolve('../../config_local');
        csrv = container.resolve(ConfigLocalService);
      } catch (e) {
        csrv = container.resolve(ConfigEnvService);
      }
    }
    return csrv;
  };
}
