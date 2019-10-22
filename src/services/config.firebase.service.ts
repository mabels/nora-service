import { Config } from './config';
import { ConfigService } from './config.service';

export class ConfigFireBaseService implements ConfigService {

  public async init(): Promise<Config> {
    // throw Error('Missing');
    return {
      isLocal: false,
      oauthClientId: 'node-red--smarthome',
      port: '',
      oauthClientSecret: '',
      jwtCookieName: 'NodeRedSmartHome',
      serviceAccountIssuer: 'firebase-adminsdk-skg42@winsen-home.iam.gserviceaccount.com'
    };
  }
}
