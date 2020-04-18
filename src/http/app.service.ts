import { Inject } from '@andrei-tatar/ts-ioc';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { Config } from '../config';
import { container } from '../container';
import { ConfigService } from '../services/config.service';
import { LogService } from '../services/log-service';
import controllers from './controllers';
import { Http } from './decorators/http';
import { authMiddleware } from './middlewares/auth';
import { containerMiddleware, destroyContainerMiddleware } from './middlewares/container';
import { exceptionMiddleware } from './middlewares/exception';

export class AppService {
    public readonly express: express.Express;

    constructor(@Inject(ConfigService) config: Config,
                @Inject(LogService) log: LogService) {
        this.express = express();
        this.express.use(cors());

        this.express.use(log.morgan);

        this.express.use('/module/firebaseui', express.static('./node_modules/firebaseui'));

        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(cookieParser());
        this.express.use(containerMiddleware(container));
        this.express.use(authMiddleware(config, container));
        this.express.use(
            Http.controllers(controllers, {
                resolveController: (_req, res, type) => res.locals.container.resolve(type),
            })
        );

        this.express.use(exceptionMiddleware());
        this.express.use(destroyContainerMiddleware());
    }
}
