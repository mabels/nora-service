import { Inject } from '@andrei-tatar/ts-ioc';

import { Input } from '../../google';
import { DevicesFromUid, DevicesFromUidFactory } from '../../services/devices.from.uid';
import { LogService } from '../../services/log-service';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { authFilter } from '../middlewares/auth';
// import { DisconnectService } from '../services/disconnect.service';
// import { ExecuteService } from '../services/execute.service';
// import { QueryService } from '../services/query.service';
// import { SyncService } from '../services/sync.service';
import { Controller } from './controller';

@Http.controller('/smarthome')
@Http.filter(authFilter({ scope: 'google-home-auth' }))
export class SmartHomeController extends Controller {

    constructor(
        // @Inject(SyncService) private syncService: Lazy<SyncService>,
        // @Inject(QueryService) private queryService: Lazy<QueryService>,
        // @Inject(ExecuteService) private executeService: Lazy<ExecuteService>,
        // @Inject(DisconnectService) private disconnectService: Lazy<DisconnectService>,
        @Inject(DevicesFromUidFactory) private devicesFromUid: DevicesFromUid,
        @Inject(LogService) private log: LogService,

    ) {
        super();
    }

    @Http.post('/fulfill')
    async fulfill(
        @Param.fromBody('inputs') inputs: Input[],
        @Param.fromBody('requestId') requestId: string,
    ) {
        this.log.info('FulFill:', JSON.stringify(this.request.body));
        const devices = await this.devicesFromUid.get(this.request.token.uid);
        return devices.processInputs(requestId, inputs);
    }
}
