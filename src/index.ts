import * as functions from 'firebase-functions';
import * as http from 'http';
import * as https from 'https';
import * as process from 'process';
import 'reflect-metadata';

import { Config } from './config';
import { container } from './container';
import { appFactory } from './http/app.factory';
import { ConfigService } from './services/config.service';
import { initWebSocketListener } from './socket';

const  fireBaseExports: any = {};
export = fireBaseExports;

const config = container.resolve<Config>(ConfigService);
const app = appFactory(config);

if (typeof process.env.FIREBASE_CONFIG === 'undefined') {
  config.serviceSockets.forEach(srv => {
    const server = srv.tls.val ? https.createServer(srv.tls.val, app) : http.createServer(app);
    initWebSocketListener(config, server, container);
    server.listen({
      port: srv.port,
      address: srv.address
    }, () =>
      console.log(`listening ${srv.tls ? 'https' : 'http'} on ${srv.address ? '[' + srv.address + '] ' : ''}${srv.port}`)
    );
  });
} else {
  console.log('FireBase-Mode');
  // // Start writing Firebase Functions
  // // https://firebase.google.com/docs/functions/typescript
  //
  fireBaseExports.nora  = functions.https.onRequest((request, response) => {
    console.log('fireBaseRequest:', request.path);
    app(request, response);
//    response.send(`Hello from nora!
//                  <code>${JSON.stringify(process.env, null, 2)}</code>
//                  <code>${request}</code>
//                  `);
  });
}

