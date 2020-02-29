import { Inject, Lazy } from '@andrei-tatar/ts-ioc';

import { FulfillPayload, FulfillResponse, Input, Intent } from '../../google';
import { AdminFirebaseService } from '../../services/firebase.service';
import { LogService } from '../../services/log-service';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { authFilter } from '../middlewares/auth';
import { DisconnectService } from '../services/disconnect.service';
import { ExecuteService } from '../services/execute.service';
import { QueryService } from '../services/query.service';
import { SyncService } from '../services/sync.service';
import { Controller } from './controller';

@Http.controller('/smarthome')
@Http.filter(authFilter({ scope: 'google-home-auth' }))
export class SmartHomeController extends Controller {

    constructor(
        @Inject(SyncService) private syncService: Lazy<SyncService>,
        @Inject(QueryService) private queryService: Lazy<QueryService>,
        @Inject(ExecuteService) private executeService: Lazy<ExecuteService>,
        @Inject(DisconnectService) private disconnectService: Lazy<DisconnectService>,
        @Inject(LogService) private log: LogService,
        @Inject(AdminFirebaseService) private firebase: AdminFirebaseService
    ) {
        super();
    }

    private async storeFirebase(uid: string, requestId: string, inputs: Input[]) {
        const batch = this.firebase.firestore.batch();
        const doc = this.firebase.firestore.doc(`fulfill/${uid}`);
        batch.set(doc, {uid, requestId, inputs });
        return batch.commit();
    }

    @Http.post('/fulfill')
    async fulfill(
        @Param.fromBody('inputs') inputs: Input[],
        @Param.fromBody('requestId') requestId: string,
    ) {
        this.log.info('FulFill:', JSON.stringify(this.request.body));
        setImmediate(() => {
            this.storeFirebase(this.request.token.uid, requestId, inputs)
            .then()
            .catch(e => console.log(`FirebaseStore:`, e));
        });
        let payload: FulfillPayload;
        for (const input of inputs) {
            this.log.info(`executing ${input.intent} for ${this.request.token.uid}`);
            switch (input.intent) {
                case Intent.Sync:
                    payload = this.syncService.value.sync(requestId);
                    break;
                case Intent.Query:
                    payload = this.queryService.value.query(input);
                    break;
                case Intent.Execute:
                    payload = this.executeService.value.execute(input, requestId);
                    break;
                case Intent.Disconnect:
                    await this.disconnectService.value.disconnect();
                    return {};
                default:
                    throw new Error('unsupported intent');
            }
        }

        const response: FulfillResponse = {
            requestId,
            payload,
        };

        return response;
    }
}
