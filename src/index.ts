import 'reflect-metadata';

import { createServer } from 'http';
import { port } from './config';
import { container } from './container';
import { app } from './http/app';
import { initWebSocketListener } from './socket';


import * as express from 'express';
const base = express();
base.use(app);

const server = createServer(base);
initWebSocketListener(server, container);
server.listen(port, () => console.log(`listening on ${port}`));
