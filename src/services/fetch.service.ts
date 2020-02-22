import { Inject } from '@andrei-tatar/ts-ioc';
import { LogService } from '../../services/log-service';

import fetch, {RequestInit, Response} from 'node-fetch';

export class FetchService {

    constructor(@Inject(LogService) private log: LogService) { }

    public run(url: string, init?: RequestInit): Promise<Response> {
        this.log.fetch(`fetch:${url}`);
        return fetch(url, init);
    }

}
