import * as process from 'process';
import 'reflect-metadata';

import { container } from './container';
import { ExpressServerService } from './http/express.server.service';
import { FireBaseServerService } from './http/firebase.server.service';

const  fireBaseExports: any = {};
export = fireBaseExports;

if (typeof process.env.FIREBASE_CONFIG === 'undefined') {
  container.resolve<ExpressServerService>(ExpressServerService);
} else {
  fireBaseExports.nora = container.resolve<FireBaseServerService>(FireBaseServerService).exportRef;
}

