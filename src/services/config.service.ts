import { Config } from './config';

export interface ConfigService {
  init(): Promise<Config>;
}
