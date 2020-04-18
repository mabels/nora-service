import { Inject } from '@andrei-tatar/ts-ioc';
import * as functions from 'firebase-functions';

import { LogService } from '../services/log-service';
import { AppService } from './app.service';

export class FireBaseServerService {
    public readonly exportRef;
    constructor(@Inject(LogService) log: LogService,
                @Inject(AppService) app: AppService) {
        log.info('FireBase-Mode');
        this.exportRef = functions
            .region('europe-west1')
            .https.onRequest((request, response) => {
                console.info('fireBaseRequest:', request.path);
                app.express(request, response);
            });
    }
}
