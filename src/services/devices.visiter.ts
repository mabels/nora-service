import { Inject } from '@andrei-tatar/ts-ioc';

import { DisconnectService } from '../http/services/disconnect.service';
import { ExecuteService } from '../http/services/execute.service';
import { QueryService } from '../http/services/query.service';
import { SyncService } from '../http/services/sync.service';
import { LogService } from './log-service';

export class DevicesVisiter {

    constructor(
        @Inject(LogService) public readonly log: LogService,
        @Inject(SyncService) public readonly syncService: SyncService,
        @Inject(QueryService) public readonly queryService: QueryService,
        @Inject(ExecuteService) public readonly executeService: ExecuteService,
        @Inject(DisconnectService) public readonly disconnectService: DisconnectService,
    ) {}

}
