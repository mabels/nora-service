// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
// tslint:disable-next-line:no-import-side-effect
import '../build/container';

import * as functions from 'firebase-functions';


// import { createServer } from 'http';
// import { port } from '../build/config';
import { app } from '../build/http/app';


import * as express from 'express';
const base = express();
base.use('/', app);

export const noraService = functions.https.onRequest(base);
