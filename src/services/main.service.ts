
import { Inject } from '@andrei-tatar/ts-ioc';
import { routerFactory } from '../http/router.factory';
import { initWebSocketListener } from '../socket';
import { ConfigService } from './config.service';

import * as express from 'express';
import { createServer } from 'http';
import { container } from '../container';

export class MainService {

  @Inject('ConfigService')
  readonly configService: ConfigService;

  public async start() {
    const base = express();
    const config = await this.configService.init();
    console.log('MainService:', config.baseUrl || '/');
    base.use(config.baseUrl || '/', routerFactory(config));
    const server = createServer(base);
    initWebSocketListener(server, container, config);
    server.listen(config.port, () => console.log(`listening on ${config.port}`));
  }
}
