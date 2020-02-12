import { Inject } from '@andrei-tatar/ts-ioc';
import fetch from 'node-fetch';

import { Config } from '../config';
import { delay } from '../util';
import { ConfigService } from './config.service';
import { UserRepository } from './user.repository';

export class RequestSyncService {

    constructor(
        @Inject('uid')
        private uid: string,
        private userRepo: UserRepository,
        @Inject(ConfigService)
        private config: Config
    ) {
    }

    async requestSync() {
        console.log(`RequestSyncService:`, this.uid, await this.userRepo.isUserLinked(this.uid));
        if (!await this.userRepo.isUserLinked(this.uid)) { return; }

        while (true) {
            console.log(`fetch: https://homegraph.googleapis.com/v1/devices:requestSync?key=${this.config.googleProjectApiKey}`, this.uid);
            const response = await fetch(`https://homegraph.googleapis.com/v1/devices:requestSync?key=${this.config.googleProjectApiKey}`, {
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
