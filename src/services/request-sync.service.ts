import { Inject } from '@andrei-tatar/ts-ioc';

import { Config } from '../config';
import { FetchService } from '../http/services/fetch.service';
import { delay } from '../util';
import { ConfigService } from './config.service';
import { UserRepository, UserRepositoryFactory } from './user.repository';

export class RequestSyncService {

    constructor(
        @Inject('uid') private uid: string,
        @Inject(UserRepositoryFactory) private userRepo: UserRepository,
        @Inject(ConfigService) private config: Config,
        @Inject(FetchService) private fetch: FetchService
    ) {
    }

    async requestSync() {
        if (!await this.userRepo.isUserLinked(this.uid)) { return; }

        while (true) {
            // tslint:disable-next-line:max-line-length
            const response = await this.fetch.run(`https://homegraph.googleapis.com/v1/devices:requestSync?key=${this.config.googleProjectApiKey}`, {
                method: 'post',
                body: JSON.stringify({ agentUserId: this.uid }),
                headers: { 'content-type': 'application/json' },
            });
            if (response.ok) { return; }
            if (response.status === 429) {
                await delay((Math.floor(Math.random() * 20) + 5) * 1000);
                continue;
            }

            throw new Error(`while requestSync (${this.uid}). status: ${response.status} - ${await response.text()}`);
        }
    }
}
