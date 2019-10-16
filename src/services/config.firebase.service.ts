import { Config } from './config';
import { ConfigService } from './config.service';

export class ConfigFireBaseService implements ConfigService {

  public async init(): Promise<Config> {
    throw Error('Missing');
  }
}
