import { Inject } from '@andrei-tatar/ts-ioc';
import morgan from 'morgan';

import { RequestHandler } from 'express-serve-static-core';
import { Config } from '../config';
import { ConfigService } from './config.service';

export class LogService {
    public readonly morgan: RequestHandler;

    constructor(@Inject(ConfigService) private config: Config) {
        if (this.config.isLocal) {
            this.morgan = morgan('combined');
        } else {
            this.morgan = () => { };
        }
    }

    public fetch(...args) {
        if (this.config) {
            console.info('fetch:', ...args);
        }
    }

    public info(...args) {
        if (this.config) {
            console.info('info:', ...args);
        }
    }

    public error(...args) {
        if (this.config) {
            console.error('error:', ...args);
        }
    }

}