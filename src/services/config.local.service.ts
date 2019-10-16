import { Config } from './config';
import { ConfigService } from './config.service';

export class ConfigLocalService implements ConfigService {
  private _config?: Config;

  public async init(): Promise<Config> {
    if (!this._config) {
      this._config = {
        ...require('../../config_local'),
        isLocal: true
      };
    }
    return this._config;
  }
}
