// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
// tslint:disable-next-line:no-import-side-effect

import { container } from '../build/container';
import * as functions from 'firebase-functions';
import * as express from 'express';
import { routerFactory } from '../build/http/router.factory'

const base = express();
let handle: (_req: express.Request, _res: express.Response, next: express.NextFunction) => void;

// tslint:disable-next-line: no-floating-promises
base.use('/', async (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
  if (!handle) {
    const config = await container.resolve('ConfigService').init();
    handle = routerFactory(config)
    //handle = (router as unknown as {
    //  handle: (_req: express.Request, _res: express.Response, next: express.NextFunction) => void
    //}).handle.bind(router);
  }
  handle(_req, _res, next);
});

export const noraService = functions.https.onRequest(base);
