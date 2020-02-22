import { Inject } from '@andrei-tatar/ts-ioc';
import * as http from 'http';
import * as https from 'https';

import { Config } from '../config';
import { ConfigService } from '../services/config.service';
import { FirebaseService } from '../services/firebase.service';
import { LogService } from '../services/log-service';
import { WebSocketService } from '../socket/websocket.service';
import { AppService } from './app.service';

export class ExpressServerService {
    constructor(
        @Inject(ConfigService) config: Config,
        @Inject(AppService) app: AppService,
        @Inject(WebSocketService) ws: WebSocketService,
        @Inject(LogService) log: LogService,
        @Inject(FirebaseService) _firebase: FirebaseService
    ) {
        config.serviceSockets.forEach(srv => {
            const server = srv.tls.val ? https.createServer(srv.tls.val, app.express) : http.createServer(app.express);
            ws.register(server);
            server.listen(
                {
                    port: srv.port.val,
                    address: srv.address.val,
                },
                () =>
                    log.info(
                        `listening ${srv.tls.val ? 'https' : 'http'} on ${srv.address.val ? '[' + srv.address.val + '] ' : ''}${
                            srv.port.val
                        }`,
                    ),
            );
        });
    }
}
