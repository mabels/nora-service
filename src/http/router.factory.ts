import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';

import { authMiddleware } from './middlewares/auth';

import { container } from '../container';
import { Config } from '../services/config';
import controllers from './controllers';
import { Http } from './decorators/http';
import { containerMiddleware, destroyContainerMiddleware } from './middlewares/container';
import { exceptionMiddleware } from './middlewares/exception';

export function routerFactory(config: Config): express.Router {
  const app = express.Router();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(containerMiddleware(container));
  app.use(authMiddleware(config));
  app.use(Http.controllers(controllers, {
    resolveController: (req, type) => req.container.resolve(type),
  }));
  app.use(exceptionMiddleware());
  app.use(destroyContainerMiddleware());
  return app;
}
